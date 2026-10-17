---
title: AquaTriage
emoji: 🌊
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# AquaTriage - Backend

Detects underwater debris in ROV/diver frames using a pretrained MBARI YOLOv8 model,
places detections on a 2-D seafloor grid with simulated ROV positions, and plans the
shortest cleanup route vs. a blind lawnmower sweep.

**Honesty notice:** Positions are simulated from image position and a synthetic ROV
track. The pill "Demo data: simulated positions" is always visible in the UI.

---

## Run Backend

### PowerShell commands

```powershell
# 1. Activate the venv (from C:\aquatriage)
C:\aquatriage\.venv\Scripts\Activate.ps1

# 2. First time only: build survey1/2/3 from backend/samples
python -m backend.scripts.make_surveys

# 3. Start the server
uvicorn backend.main:app --port 8000

# Server: http://localhost:8000
# Frontend expects CORS from: http://localhost:5173
```

### Run tests

```powershell
pytest tests/ -v
```

---

## Survey Counts

22 of 30 TrashCan sample frames contained at least one trash detection (conf >= 0.30).

| Survey  | Frames | Pins | Marine life |
|---------|--------|------|-------------|
| survey1 | 8      | 5    | 1           |
| survey2 | 8      | 6    | 1           |
| survey3 | 6      | 0    | 0           |

---

## Example Route Results

### survey1 (5 pins)

- Optimized: **466.6 m** | Naive lawnmower: 3030.6 m | Saved: **84.6%**
- Order: pin1 -> pin5 -> pin4 -> pin2 -> pin3
- Algorithm: nearest-neighbour + 2-opt

### survey2 (6 pins)

- Optimized: **456.1 m** | Naive lawnmower: 3030.6 m | Saved: **85.0%**
- Order: pin1 -> pin3 -> pin6 -> pin5 -> pin4 -> pin2
- Algorithm: nearest-neighbour + 2-opt

### survey3 (0 pins)

- No debris at conf >= 0.4 -- empty route, saved_pct = 0

---

## API Contract

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/surveys | List all surveys |
| POST | /api/survey/{id}?conf=0.4&correct=true | Run inference on all frames |
| POST | /api/detect | Single-image upload (multipart: image, conf, correct) |
| POST | /api/route | Plan optimized route {start, pins} |

CORS enabled for http://localhost:5173 and http://127.0.0.1:5173.

### Class mapping

| Model class | UI label | Routed? |
|-------------|----------|---------|
| trash | Debris (cyan pin) | Yes |
| rov | (silently ignored) | Never |
| fish, eel, crab, shells, plant, animal_misc, starfish, shark, ray, jellyfish, bird | Marine life (grey) | No |

### Priority rule (backend/core.py)

```
High   -- confidence >= 0.75 AND bbox area in top third of survey debris
Low    -- bbox area in bottom third OR confidence < 0.5
Medium -- otherwise
```

### Grid

- 700 x 460 units; 1 unit = 0.5 m
- Start buoy fixed at (40, 40)
- Positions: simulated boustrophedon ROV track + bbox-centre offset
- Lengths in metres

### Route algorithm

nearest-neighbour + 2-opt (open path from start buoy through Debris pins).
Naive baseline = boustrophedon sweep in rows 60 units apart.
saved_pct = (naive - optimized) / naive * 100, rounded to 1 decimal.

---

## Datasets and Model

Sample frames: TrashCan 1.0 (UMN). Model: FathomNet/trash-detector (MBARI), CC-BY-4.0.

---

## Architecture

```
C:\aquatriage\
+-- backend/
|   +-- __init__.py
|   +-- core.py          # colour correction, inference, routing, pin building
|   +-- main.py          # FastAPI app (lifespan model load, CORS, all routes)
|   +-- models/          # MBARI YOLOv8x .pt (130 MB)
|   +-- samples/         # 30 TrashCan frames (read-only)
|   +-- samples_final/   # 6 hand-picked frames
|   +-- survey1/         # 8 images (built by make_surveys.py)
|   +-- survey2/         # 8 images
|   +-- survey3/         # 6 images
|   +-- scripts/
|       +-- make_surveys.py
+-- frontend/
|   +-- public/fallback/ # Pre-computed JSONs (survey*.json + *_route.json)
+-- tests/
|   +-- test_backend.py  # 24 pytest unit tests
+-- Dockerfile           # Multi-stage production container (React + FastAPI)
+-- docker-compose.yml   # Production Compose configuration
+-- render.yaml          # 1-Click Render blueprint
+-- railway.json         # Railway deployment configuration
+-- requirements.txt
+-- pytest.ini
+-- README.md
```

---

## Production Deployment (Full Stack)

AquaTriage is configured for **single-container unified deployment** hosting both the React frontend and the FastAPI backend on a single port with no CORS overhead.

### Option 1: Deploy on Render

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Add full-stack deployment configuration"
   git push origin main
   ```
2. In the [Render Dashboard](https://dashboard.render.com/):
   - Click **New +** -> **Blueprint**.
   - Select your repository `aymanchamp-sudo/aquatriage`.
   - Render automatically detects `render.yaml` and provisions the Docker Web Service.
   - Click **Apply**.
3. *Note on RAM:* Render standard instance (or 1GB+ RAM plan) is recommended because YOLOv8x inference is memory-intensive.

### Option 2: Deploy on Railway

1. Push your repository to GitHub.
2. In the [Railway Dashboard](https://railway.app/):
   - Click **New Project** -> **Deploy from GitHub repo**.
   - Select `aymanchamp-sudo/aquatriage`.
   - Railway detects `Dockerfile` and builds the service automatically.
   - In service settings, generate a domain under **Networking**.

### Option 3: Run Locally or on a VPS with Docker Compose

```bash
# Build and run containerized production app
docker compose up --build

# Open application
http://localhost:8000
```
Model weights (~130 MB) are automatically fetched from Hugging Face / HF-mirror during container build or at startup if not present.

