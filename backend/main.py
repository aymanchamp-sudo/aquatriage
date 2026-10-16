"""
AquaTriage FastAPI backend – main entry point.
Run: uvicorn backend.main:app --port 8000
"""

import pathlib
from contextlib import asynccontextmanager

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.core import (
    MODEL_PATH, GRID_W, GRID_H,
    colour_correct, run_inference, annotate,
    build_pins, compute_route, lawnmower_path,
    _encode_img,
)

# ---------------------------------------------------------------------------
BACKEND_DIR = pathlib.Path(__file__).parent
SURVEYS = {
    "survey1": BACKEND_DIR / "survey1",
    "survey2": BACKEND_DIR / "survey2",
    "survey3": BACKEND_DIR / "survey3",
}
START_BUOY = {"x": 40.0, "y": 40.0}
_MODEL = None

# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _MODEL
    from ultralytics import YOLO
    _MODEL = YOLO(str(MODEL_PATH))
    yield
    _MODEL = None

app = FastAPI(title="AquaTriage API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
def _load_images(path: pathlib.Path) -> list:
    exts = {".jpg", ".jpeg", ".png"}
    return sorted([f for f in path.iterdir() if f.suffix.lower() in exts])


def _area_thresholds(all_dets: list) -> tuple:
    areas = []
    for frame_dets in all_dets:
        for d in frame_dets:
            if d["label"] == "Debris":
                areas.append(d["bbox"][2] * d["bbox"][3])
    if len(areas) < 3:
        lo = hi = areas[0] if areas else 0.0
    else:
        areas_s = sorted(areas)
        n = len(areas_s)
        lo = areas_s[n // 3]
        hi = areas_s[(2 * n) // 3]
    return float(lo), float(hi)


def _process_survey(survey_id: str, conf: float, correct: bool) -> dict:
    if survey_id not in SURVEYS:
        raise HTTPException(404, f"Survey {survey_id!r} not found.")
    path = SURVEYS[survey_id]
    if not path.exists():
        raise HTTPException(404, f"Survey directory missing: {path}")
    files = _load_images(path)
    total = len(files)
    if total == 0:
        raise HTTPException(404, "Survey has no images.")

    all_imgs_bgr = []
    all_raw_dets = []
    for fp in files:
        img = cv2.imread(str(fp))
        if img is None:
            img = np.zeros((480, 640, 3), dtype=np.uint8)
        all_imgs_bgr.append(img)
        proc = colour_correct(img) if correct else img
        dets = run_inference(_MODEL, proc, conf)
        all_raw_dets.append(dets)

    area_low, area_high = _area_thresholds(all_raw_dets)

    frames_out = []
    all_pins   = []
    pin_counter = [0]
    marine_life_count = 0

    for idx, (fp, img, dets) in enumerate(zip(files, all_imgs_bgr, all_raw_dets)):
        raw_b64  = _encode_img(img)
        proc_img = colour_correct(img) if correct else img
        ann_img  = annotate(proc_img, dets)
        ann_b64  = _encode_img(ann_img)
        h, w     = img.shape[:2]

        frame_pins = build_pins(dets, idx, total, w, h, area_low, area_high, pin_counter)
        all_pins.extend(frame_pins)
        marine_life_count += sum(1 for d in dets if d["label"] == "Marine life")

        frames_out.append({
            "index":      idx,
            "raw_image":  raw_b64,
            "image":      ann_b64,
            "detections": dets,
        })

    return {
        "frames_checked":    total,
        "marine_life_count": marine_life_count,
        "frames":            frames_out,
        "pins":              all_pins,
        "start":             START_BUOY,
    }

# ---------------------------------------------------------------------------
@app.get("/api/surveys")
def list_surveys():
    result = []
    for sid, path in SURVEYS.items():
        frames = len(_load_images(path)) if path.exists() else 0
        result.append({"id": sid, "name": sid.replace("survey", "Survey "), "frames": frames})
    return result


@app.post("/api/survey/{survey_id}")
def run_survey(survey_id: str, conf: float = 0.4, correct: bool = True):
    return _process_survey(survey_id, conf, correct)


@app.post("/api/detect")
async def detect_single(
    image: UploadFile = File(...),
    conf:    float = Form(0.4),
    correct: bool  = Form(True),
):
    data = await image.read()
    arr  = np.frombuffer(data, np.uint8)
    img  = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(400, "Cannot decode image.")

    raw_b64  = _encode_img(img)
    proc_img = colour_correct(img) if correct else img
    dets     = run_inference(_MODEL, proc_img, conf)
    ann_img  = annotate(proc_img, dets)
    ann_b64  = _encode_img(ann_img)

    h, w = img.shape[:2]
    areas    = [d["bbox"][2] * d["bbox"][3] for d in dets if d["label"] == "Debris"]
    area_low  = min(areas) if areas else 0.0
    area_high = max(areas) if areas else 0.0
    pin_counter = [0]
    pins = build_pins(dets, 0, 1, w, h, area_low, area_high, pin_counter)

    return {
        "index":             0,
        "raw_image":         raw_b64,
        "image":             ann_b64,
        "detections":        dets,
        "pins":              pins,
        "start":             START_BUOY,
        "frames_checked":    1,
        "marine_life_count": sum(1 for d in dets if d["label"] == "Marine life"),
    }


class RouteRequest(BaseModel):
    start: dict
    pins:  list

@app.post("/api/route")
def plan_route(req: RouteRequest):
    return compute_route(req.start, req.pins)
