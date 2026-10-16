"""
AquaTriage Backend – core detection, mapping, and routing engine.
"""

import base64
import math
import pathlib
from typing import Optional

import cv2
import numpy as np

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
GRID_W = 700          # grid units
GRID_H = 460          # grid units
UNIT_M = 0.5          # metres per grid unit
MAX_IMG_W = 960       # max width for returned images

MODEL_PATH = pathlib.Path(__file__).parent / "models" / "trash_mbari_09072023_640imgsz_50epochs_yolov8.pt"

# ---------------------------------------------------------------------------
# Class mapping  (honesty rules)
# ---------------------------------------------------------------------------
DEBRIS_CLASSES  = {"trash"}
IGNORED_CLASSES = {"rov"}           # equipment – never a pin
MARINE_CLASSES  = {
    "fish", "eel", "crab", "shells", "plant",
    "animal_misc", "starfish", "shark", "ray",
    "jellyfish", "bird",
}

def map_class(cls_name: str) -> Optional[str]:
    """Return 'Debris', 'Marine life', or None (ignored)."""
    c = cls_name.lower().strip()
    if c in DEBRIS_CLASSES:
        return "Debris"
    if c in MARINE_CLASSES:
        return "Marine life"
    if c in IGNORED_CLASSES:
        return None
    return "Marine life"     # safe default for unknown classes


# ---------------------------------------------------------------------------
# Colour correction
# ---------------------------------------------------------------------------
def colour_correct(img_bgr: np.ndarray) -> np.ndarray:
    """Gray-world white balance + red-channel boost + CLAHE on L channel."""
    b, g, r = cv2.split(img_bgr.astype(np.float32))
    mean_b, mean_g, mean_r = b.mean(), g.mean(), r.mean()
    mean_all = (mean_b + mean_g + mean_r) / 3.0
    if mean_b > 0 and mean_g > 0 and mean_r > 0:
        b = np.clip(b * (mean_all / mean_b), 0, 255)
        g = np.clip(g * (mean_all / mean_g), 0, 255)
        r = np.clip(r * (mean_all / mean_r), 0, 255)
    # Red-channel boost for underwater red-attenuation
    r = np.clip(r * 1.4, 0, 255)
    img_bgr = cv2.merge([b, g, r]).astype(np.uint8)
    # CLAHE on L channel
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_ch = clahe.apply(l_ch)
    lab = cv2.merge([l_ch, a_ch, b_ch])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


# ---------------------------------------------------------------------------
# ROV track simulation (deterministic S-curve / boustrophedon)
# ---------------------------------------------------------------------------
def rov_position(frame_index: int, total_frames: int) -> tuple:
    """
    Returns (x, y) grid position for a frame along a smooth boustrophedon path.
    Grid is 700x460. Margins: 60 x, 50 y.
    """
    t = frame_index / max(total_frames - 1, 1)   # 0..1
    rows = 5
    row = int(t * rows)
    t_in_row = (t * rows) - row

    margin_x, margin_y = 60, 50
    usable_w = GRID_W - 2 * margin_x
    usable_h = GRID_H - 2 * margin_y
    row_h = usable_h / rows

    if row % 2 == 0:
        x = margin_x + t_in_row * usable_w
    else:
        x = margin_x + (1 - t_in_row) * usable_w

    y = margin_y + row * row_h + row_h * 0.5

    return float(np.clip(x, 0, GRID_W)), float(np.clip(y, 0, GRID_H))


# ---------------------------------------------------------------------------
# Priority rule
# ---------------------------------------------------------------------------
def compute_priority(conf: float, area: float, area_low: float, area_high: float) -> str:
    """
    High   if confidence >= 0.75 AND area is in the top third of survey debris
    Low    if area in the bottom third OR confidence < 0.5
    Medium otherwise
    """
    in_top_third    = area >= area_high
    in_bottom_third = area <= area_low
    if conf >= 0.75 and in_top_third:
        return "High"
    if in_bottom_third or conf < 0.5:
        return "Low"
    return "Medium"


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------
def _encode_img(img_bgr: np.ndarray, max_w: int = MAX_IMG_W) -> str:
    h, w = img_bgr.shape[:2]
    if w > max_w:
        scale = max_w / w
        img_bgr = cv2.resize(img_bgr, (max_w, int(h * scale)), interpolation=cv2.INTER_AREA)
    _, buf = cv2.imencode(".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return "data:image/jpeg;base64," + base64.b64encode(buf).decode()


def annotate(img_bgr: np.ndarray, detections: list) -> np.ndarray:
    """Draw coloured bboxes on a copy of the image."""
    out = img_bgr.copy()
    for d in detections:
        x, y, w, h = d["bbox"]
        label = d["label"]
        conf  = d["confidence"]
        color = (0, 240, 255) if label == "Debris" else (120, 120, 120)
        cv2.rectangle(out, (x, y), (x + w, y + h), color, 2)
        txt = f"{label} {conf:.2f}"
        (tw, th), _ = cv2.getTextSize(txt, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(out, (x, y - th - 6), (x + tw + 4, y), color, -1)
        cv2.putText(out, txt, (x + 2, y - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (7, 11, 20), 1, cv2.LINE_AA)
    return out


# ---------------------------------------------------------------------------
# Inference
# ---------------------------------------------------------------------------
def run_inference(model, img_bgr: np.ndarray, conf_thresh: float) -> list:
    """Run YOLO and return list of detection dicts (rov filtered out)."""
    results = model.predict(img_bgr, conf=conf_thresh, imgsz=640, verbose=False)
    detections = []
    if not results:
        return detections
    result = results[0]
    names  = model.names
    for box in result.boxes:
        cls_id   = int(box.cls[0])
        cls_name = names[cls_id]
        label    = map_class(cls_name)
        if label is None:      # rov and other ignored classes
            continue
        conf  = float(box.conf[0])
        x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
        detections.append({
            "label":      label,
            "cls":        cls_name,
            "confidence": round(conf, 4),
            "bbox":       [x1, y1, x2 - x1, y2 - y1],
        })
    return detections


# ---------------------------------------------------------------------------
# Pin builder
# ---------------------------------------------------------------------------
def build_pins(detections: list, frame_idx: int, total_frames: int,
               img_w: int, img_h: int,
               area_low: float, area_high: float,
               pin_counter: list) -> list:
    """
    For each Debris detection produce a grid pin.
    pin_counter is a mutable [int] shared by the caller for unique IDs.
    """
    rov_x, rov_y = rov_position(frame_idx, total_frames)
    pins = []
    for d in detections:
        if d["label"] != "Debris":
            continue
        bx, by, bw, bh = d["bbox"]
        cx = bx + bw / 2
        cy = by + bh / 2
        dx = (cx / img_w - 0.5) * 70
        dy = (cy / img_h - 0.5) * 50
        gx = float(np.clip(rov_x + dx, 0, GRID_W))
        gy = float(np.clip(rov_y + dy, 0, GRID_H))
        area = bw * bh
        priority = compute_priority(d["confidence"], area, area_low, area_high)
        pin_counter[0] += 1
        pid = pin_counter[0]
        pins.append({
            "id":         f"pin{pid}",
            "x":          round(gx, 1),
            "y":          round(gy, 1),
            "priority":   priority,
            "confidence": d["confidence"],
            "frame":      frame_idx,
            "item":       f"Debris #{pid}",
        })
    return pins


# ---------------------------------------------------------------------------
# Routing
# ---------------------------------------------------------------------------
def _dist(a: dict, b: dict) -> float:
    return math.hypot(a["x"] - b["x"], a["y"] - b["y"])


def nearest_neighbour(start: dict, pins: list) -> list:
    """Open-path nearest-neighbour from start through all pins."""
    if not pins:
        return []
    remaining = list(pins)
    path = []
    current = start
    while remaining:
        nearest = min(remaining, key=lambda p: _dist(current, p))
        path.append(nearest)
        remaining.remove(nearest)
        current = nearest
    return path


def _path_len(start: dict, route: list) -> float:
    if not route:
        return 0.0
    total = _dist(start, route[0])
    for i in range(len(route) - 1):
        total += _dist(route[i], route[i + 1])
    return total


def two_opt(route: list, start: dict) -> list:
    """2-opt improvement on an open path (start fixed)."""
    if len(route) < 2:
        return route
    best = list(route)
    improved = True
    while improved:
        improved = False
        for i in range(len(best) - 1):
            for j in range(i + 2, len(best)):
                new_route = best[:i + 1] + best[i + 1:j + 1][::-1] + best[j + 1:]
                if _path_len(start, new_route) < _path_len(start, best):
                    best = new_route
                    improved = True
    return best


def lawnmower_path(start: dict) -> list:
    """
    Naive boustrophedon sweep of the 700x460 grid in rows 60 units apart.
    """
    path = [start]
    y = 30
    row = 0
    while y <= GRID_H:
        if row % 2 == 0:
            path.append({"x": 0.0,          "y": float(y)})
            path.append({"x": float(GRID_W), "y": float(y)})
        else:
            path.append({"x": float(GRID_W), "y": float(y)})
            path.append({"x": 0.0,          "y": float(y)})
        y += 60
        row += 1
    return path


def path_length_m(start: dict, route: list) -> float:
    return _path_len(start, route) * UNIT_M


def compute_route(start: dict, pins: list) -> dict:
    """Full route computation."""
    naive_wps = lawnmower_path(start)
    naive_len = 0.0
    for i in range(len(naive_wps) - 1):
        naive_len += _dist(naive_wps[i], naive_wps[i + 1])
    naive_len_m = naive_len * UNIT_M

    if len(pins) <= 1:
        opt_path = [{"x": p["x"], "y": p["y"]} for p in pins]
        opt_len_m = path_length_m(start, pins) if pins else 0.0
        return {
            "order":              [p["id"] for p in pins],
            "path":               [start] + opt_path,
            "naive_path":         naive_wps,
            "naive_length_m":     round(naive_len_m, 1),
            "optimized_length_m": round(opt_len_m, 1),
            "saved_pct":          0.0,
            "algorithm":          "nearest-neighbour + 2-opt",
        }

    nn_route  = nearest_neighbour(start, pins)
    opt_route = two_opt(nn_route, start)
    opt_len_m = path_length_m(start, opt_route)
    saved_pct = round((naive_len_m - opt_len_m) / naive_len_m * 100, 1) if naive_len_m > 0 else 0.0
    saved_pct = max(0.0, saved_pct)

    return {
        "order":              [p["id"] for p in opt_route],
        "path":               [start] + [{"x": p["x"], "y": p["y"]} for p in opt_route],
        "naive_path":         naive_wps,
        "naive_length_m":     round(naive_len_m, 1),
        "optimized_length_m": round(opt_len_m, 1),
        "saved_pct":          saved_pct,
        "algorithm":          "nearest-neighbour + 2-opt",
    }
