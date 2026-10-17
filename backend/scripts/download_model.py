"""
AquaTriage model downloader script.
Ensures MBARI YOLOv8 model weights are downloaded if not already present.
"""

import os
import pathlib
import sys
import time

BACKEND_DIR = pathlib.Path(__file__).parent.parent
MODELS_DIR = BACKEND_DIR / "models"
MODEL_FILENAME = "trash_mbari_09072023_640imgsz_50epochs_yolov8.pt"
MODEL_PATH = MODELS_DIR / MODEL_FILENAME

URLS = [
    f"https://huggingface.co/FathomNet/trash-detector/resolve/main/{MODEL_FILENAME}",
    f"https://hf-mirror.com/FathomNet/trash-detector/resolve/main/{MODEL_FILENAME}",
]


def download_with_curl(url: str, dest: pathlib.Path) -> bool:
    import subprocess
    cmd = ["curl", "-f", "-L", "--retry", "3", "--retry-delay", "2", "-o", str(dest), url]
    try:
        print(f"Attempting download with curl: {url}")
        res = subprocess.run(cmd, check=True)
        return res.returncode == 0 and dest.exists() and dest.stat().st_size > 100_000_000
    except Exception as e:
        print(f"curl download failed: {e}")
        return False


def download_with_httpx(url: str, dest: pathlib.Path) -> bool:
    try:
        import httpx
        headers = {"User-Agent": "AquaTriage-Deploy/1.0"}
        print(f"Attempting download with httpx: {url}")
        with httpx.stream("GET", url, headers=headers, follow_redirects=True, timeout=120.0) as resp:
            resp.raise_for_status()
            total = int(resp.headers.get("content-length", 0))
            downloaded = 0
            with open(dest, "wb") as f:
                last_print = time.time()
                for chunk in resp.iter_bytes(chunk_size=1024 * 1024):
                    f.write(chunk)
                    downloaded += len(chunk)
                    if time.time() - last_print > 5:
                        if total:
                            print(f"Downloaded {downloaded / 1024 / 1024:.1f} MB / {total / 1024 / 1024:.1f} MB ({downloaded / total * 100:.1f}%)")
                        else:
                            print(f"Downloaded {downloaded / 1024 / 1024:.1f} MB")
                        last_print = time.time()
        return dest.exists() and dest.stat().st_size > 100_000_000
    except Exception as e:
        print(f"httpx download failed: {e}")
        return False


def download_with_urllib(url: str, dest: pathlib.Path) -> bool:
    try:
        import urllib.request
        print(f"Attempting download with urllib: {url}")
        req = urllib.request.Request(url, headers={"User-Agent": "AquaTriage-Deploy/1.0"})
        with urllib.request.urlopen(req, timeout=120.0) as resp, open(dest, "wb") as f:
            total = int(resp.headers.get("Content-Length", 0))
            downloaded = 0
            last_print = time.time()
            while True:
                chunk = resp.read(1024 * 1024)
                if not chunk:
                    break
                f.write(chunk)
                downloaded += len(chunk)
                if time.time() - last_print > 5:
                    if total:
                        print(f"Downloaded {downloaded / 1024 / 1024:.1f} MB / {total / 1024 / 1024:.1f} MB ({downloaded / total * 100:.1f}%)")
                    else:
                        print(f"Downloaded {downloaded / 1024 / 1024:.1f} MB")
                    last_print = time.time()
        return dest.exists() and dest.stat().st_size > 100_000_000
    except Exception as e:
        print(f"urllib download failed: {e}")
        return False


def ensure_model(target_path: pathlib.Path = MODEL_PATH) -> pathlib.Path:
    if target_path.exists() and target_path.stat().st_size > 100_000_000:
        print(f"Model already present at: {target_path} ({target_path.stat().st_size / 1024 / 1024:.1f} MB)")
        return target_path

    target_path.parent.mkdir(parents=True, exist_ok=True)
    temp_target = target_path.with_suffix(".tmp")
    if temp_target.exists():
        temp_target.unlink()

    success = False
    for url in URLS:
        # Try methods in sequence
        for method in [download_with_curl, download_with_httpx, download_with_urllib]:
            try:
                if method(url, temp_target):
                    temp_target.rename(target_path)
                    print(f"Successfully downloaded model to: {target_path}")
                    success = True
                    break
            except Exception as e:
                print(f"Method {method.__name__} raised error: {e}")
        if success:
            break

    if not success or not target_path.exists():
        if temp_target.exists():
            temp_target.unlink()
        raise RuntimeError(
            f"Failed to download YOLO model weights from all sources: {URLS}. "
            "Please ensure internet connectivity or place the model manually at "
            f"{target_path}"
        )

    return target_path


if __name__ == "__main__":
    ensure_model()
