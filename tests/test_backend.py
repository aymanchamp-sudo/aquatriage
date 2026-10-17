"""
AquaTriage backend unit tests.
Run: pytest tests/ -v   (from C:\aquatriage with .venv active)
"""
import math
import pytest

from backend.core import (
    map_class, compute_route, two_opt,
    nearest_neighbour, lawnmower_path,
    _path_len, compute_priority,
    GRID_W, GRID_H, build_pins,
)


# ── Helpers ─────────────────────────────────────────────────────────────────
def _pins(coords):
    return [
        {"id": f"pin{i+1}", "x": float(x), "y": float(y), "priority": "Medium"}
        for i, (x, y) in enumerate(coords)
    ]

START = {"x": 40.0, "y": 40.0}


# ── 1. Class mapping ─────────────────────────────────────────────────────────
class TestClassMapping:
    def test_trash_is_debris(self):
        assert map_class("trash") == "Debris"

    def test_rov_is_none(self):
        assert map_class("rov") is None

    def test_rov_case_insensitive(self):
        assert map_class("ROV") is None

    def test_all_marine_classes(self):
        for cls in ["fish", "eel", "crab", "shells", "plant",
                    "animal_misc", "starfish", "shark", "ray", "jellyfish", "bird"]:
            assert map_class(cls) == "Marine life", f"{cls} should be Marine life"

    def test_unknown_is_marine_life(self):
        assert map_class("unknown_blob") == "Marine life"


# ── 2. Priority rule ─────────────────────────────────────────────────────────
class TestPriority:
    def test_high(self):
        assert compute_priority(0.80, 1000, 200, 800) == "High"

    def test_low_conf(self):
        assert compute_priority(0.40, 500, 200, 800) == "Low"

    def test_low_small_area(self):
        assert compute_priority(0.80, 100, 200, 800) == "Low"

    def test_medium(self):
        assert compute_priority(0.60, 500, 200, 800) == "Medium"


# ── 3. 2-opt never longer than nearest-neighbour ─────────────────────────────
class TestTwoOpt:
    def test_2opt_not_worse(self):
        pins = _pins([(100,200),(300,50),(500,400),(200,350),(450,150),(600,300),(150,100)])
        nn  = nearest_neighbour(START, pins)
        opt = two_opt(nn, START)
        assert _path_len(START, opt) <= _path_len(START, nn) + 1e-9

    def test_2opt_single_pin(self):
        pins = _pins([(100,100)])
        opt = two_opt(nearest_neighbour(START, pins), START)
        assert len(opt) == 1

    def test_2opt_two_pins(self):
        pins = _pins([(100,0),(50,0)])
        nn  = nearest_neighbour(START, pins)
        opt = two_opt(nn, START)
        assert len(opt) == 2
        assert _path_len(START, opt) <= _path_len(START, nn) + 1e-9


# ── 4. saved_pct maths ───────────────────────────────────────────────────────
class TestSavedPct:
    def test_formula(self):
        pins = _pins([(100,200),(300,50),(500,400)])
        result = compute_route(START, pins)
        naive, opt, pct = result["naive_length_m"], result["optimized_length_m"], result["saved_pct"]
        expected = round((naive - opt) / naive * 100, 1) if naive > 0 else 0.0
        assert abs(pct - expected) < 0.05

    def test_nonnegative(self):
        result = compute_route(START, _pins([(100,100)]))
        assert result["saved_pct"] >= 0.0


# ── 5. 0 and 1 pins ─────────────────────────────────────────────────────────
class TestEdgeCases:
    def test_zero_pins(self):
        result = compute_route(START, [])
        assert result["saved_pct"] == 0.0
        assert result["order"] == []
        assert result["optimized_length_m"] == 0.0
        assert result["naive_length_m"] > 0      # lawnmower always sweeps

    def test_one_pin(self):
        result = compute_route(START, _pins([(200,200)]))
        assert result["saved_pct"] == 0.0
        assert len(result["order"]) == 1
        assert result["optimized_length_m"] > 0

    def test_no_div_by_zero(self):
        result = compute_route(START, [])
        assert isinstance(result["saved_pct"], float)


# ── 6. ROV never produces a pin ──────────────────────────────────────────────
class TestROVNeverPin:
    def test_rov_skipped(self):
        # map_class already filters rov -> None in run_inference,
        # but here we also verify build_pins won't route "Marine life"
        detections = [
            {"label": "Marine life", "cls": "fish",  "confidence": 0.9, "bbox": [10,10,50,50]},
            {"label": "Debris",      "cls": "trash", "confidence": 0.8, "bbox": [100,100,60,60]},
        ]
        counter = [0]
        pins = build_pins(detections, 0, 10, 640, 480, 0, 10000, counter)
        assert len(pins) == 1
        assert pins[0]["item"].startswith("Debris")
        assert map_class("rov") is None     # belt-and-suspenders


# ── 7. Lawnmower sanity ──────────────────────────────────────────────────────
class TestLawnmower:
    def test_covers_full_width(self):
        path = lawnmower_path(START)
        xs = [p["x"] for p in path]
        assert max(xs) == GRID_W
        assert min(xs) == 0.0

    def test_positive_length(self):
        path = lawnmower_path(START)
        total = sum(
            math.hypot(path[i+1]["x"] - path[i]["x"], path[i+1]["y"] - path[i]["y"])
            for i in range(len(path) - 1)
        )
        assert total > 0


# ── 8. /api/detect endpoint tests ───────────────────────────────────────────
class TestDetectEndpoint:
    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient
        from backend.main import app
        return TestClient(app)

    def test_detect_corrupted_image(self, client):
        res = client.post(
            "/api/detect",
            files={"image": ("download.jpg", b"not_an_image_file_content", "image/jpeg")},
        )
        assert res.status_code == 400
        assert res.json()["detail"] == "Invalid image file format or corrupted data"

    def test_detect_empty_file(self, client):
        res = client.post(
            "/api/detect",
            files={"image": ("empty.jpg", b"", "image/jpeg")},
        )
        assert res.status_code == 400
        assert res.json()["detail"] == "Invalid image file format or corrupted data"

    def test_detect_valid_image(self, client):
        import cv2
        import numpy as np
        img = np.zeros((120, 160, 3), dtype=np.uint8)
        _, buf = cv2.imencode(".jpg", img)
        res = client.post(
            "/api/detect",
            files={"image": ("download.jpg", buf.tobytes(), "image/jpeg")},
            data={"conf": "0.4", "correct": "true"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "detections" in data
        assert "pins" in data
        assert "frames" in data
        assert len(data["frames"]) == 1


class TestHealthEndpoint:
    def test_health_check(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "AquaTriage" in data["service"]

