"""
make_surveys.py – run the MBARI model on backend/samples,
keep images with >= 1 trash detection, split into survey1/2/3.

Usage (from C:\aquatriage with .venv active):
    python -m backend.scripts.make_surveys
"""

import math
import pathlib
import shutil
import sys

BACKEND     = pathlib.Path(__file__).parent.parent
SAMPLES     = BACKEND / "samples"
MODEL_PT    = BACKEND / "models" / "trash_mbari_09072023_640imgsz_50epochs_yolov8.pt"
SURVEYS     = [BACKEND / "survey1", BACKEND / "survey2", BACKEND / "survey3"]
CONF_THRESH = 0.30


def main():
    from ultralytics import YOLO
    print(f"Loading model from: {MODEL_PT}")
    model = YOLO(str(MODEL_PT))

    all_images = sorted([
        f for f in SAMPLES.iterdir()
        if f.suffix.lower() in {".jpg", ".jpeg", ".png"}
    ])
    print(f"Found {len(all_images)} images in samples/")

    kept = []
    for img_path in all_images:
        results = model.predict(str(img_path), conf=CONF_THRESH, imgsz=640, verbose=False)
        names     = model.names
        has_trash = any(names[int(box.cls[0])].lower() == "trash" for box in results[0].boxes)
        if has_trash:
            kept.append(img_path)
            print(f"  KEEP: {img_path.name}")
        else:
            print(f"  skip: {img_path.name}")

    print(f"\nKept {len(kept)} images with trash detections.")
    if len(kept) < 3:
        print("ERROR: fewer than 3 images – cannot build surveys.")
        sys.exit(1)

    for s in SURVEYS:
        s.mkdir(parents=True, exist_ok=True)

    n    = len(kept)
    size = math.ceil(n / 3)
    chunks = [kept[i : i + size] for i in range(0, n, size)]
    while len(chunks) < 3:
        chunks.append([])
    chunks = chunks[:3]

    for survey_dir, chunk in zip(SURVEYS, chunks):
        for old in survey_dir.iterdir():
            if old.is_file():
                old.unlink()
        for img_path in chunk:
            shutil.copy2(img_path, survey_dir / img_path.name)
        print(f"{survey_dir.name}: {len(chunk)} images copied")

    print("\nSurveys created:")
    for s in SURVEYS:
        imgs = sorted(s.glob("*.*"))
        print(f"  {s.name}: {len(imgs)} images")


if __name__ == "__main__":
    main()
