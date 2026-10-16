"""
precompute_fallbacks.py
Pre-calls the live API for each survey and saves JSON fallbacks to
frontend/public/fallback/survey{N}.json
Also calls /api/route for each survey and prints a summary.
"""
import json
import pathlib
import time
import urllib.request
import urllib.error
import sys

# Fix Windows console encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = "http://localhost:8000"
OUT_DIR = pathlib.Path(r"C:\aquatriage\frontend\public\fallback")
OUT_DIR.mkdir(parents=True, exist_ok=True)

def http_get(url):
    with urllib.request.urlopen(url) as r:
        return json.loads(r.read())

def http_post(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data,
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

print("Waiting for server warmup...")
time.sleep(3)

# surveys list
surveys = http_get(f"{BASE}/api/surveys")
print("Surveys:", surveys)

for s in surveys:
    sid = s["id"]
    print(f"\n--- {sid} ({s['frames']} frames) ---")
    
    # Run survey inference
    print(f"  POST /api/survey/{sid} ...")
    result = http_post(f"{BASE}/api/survey/{sid}?conf=0.4&correct=true", {})
    
    frames_checked = result["frames_checked"]
    marine_life    = result["marine_life_count"]
    pins           = result["pins"]
    start          = result["start"]
    
    print(f"  frames_checked={frames_checked}  marine_life={marine_life}  pins={len(pins)}")
    for p in pins:
        print(f"    {p['id']} @ ({p['x']:.0f},{p['y']:.0f})  {p['priority']}  conf={p['confidence']:.2f}  {p['item']}")
    
    # Strip base64 images from fallback JSON to keep file size sane
    fallback = {
        "frames_checked":    frames_checked,
        "marine_life_count": marine_life,
        "frames":            [
            {k: v for k, v in f.items() if k not in ("raw_image", "image")}
            for f in result["frames"]
        ],
        "pins":  pins,
        "start": start,
    }
    out_path = OUT_DIR / f"{sid}.json"
    out_path.write_text(json.dumps(fallback, indent=2), encoding="utf-8")
    print(f"  Saved: {out_path}")
    
    # Route
    if pins:
        route = http_post(f"{BASE}/api/route", {"start": start, "pins": pins})
        print(f"  Route: optimized={route['optimized_length_m']}m  naive={route['naive_length_m']}m  saved={route['saved_pct']}%")
        print(f"  Order: {route['order']}")
        # Save route fallback
        route_path = OUT_DIR / f"{sid}_route.json"
        route_path.write_text(json.dumps(route, indent=2), encoding="utf-8")
        print(f"  Route saved: {route_path}")
    else:
        print("  No pins - skipping route")

print("\nFallback precomputation complete.")
