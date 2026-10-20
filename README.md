# AquaTriage

Underwater debris detection and cleanup route planning for ROV and diver footage.

AquaTriage runs a pretrained MBARI YOLOv8 model on survey frames, places each detection on a 2-D seafloor grid, ranks debris by priority, and plans the shortest cleanup route from the start buoy. It then compares that route against a blind lawnmower sweep of the same area.

> **Honesty notice:** Positions are simulated. Each pin is placed from its position in the image plus a synthetic ROV track, not from real GPS or sonar data. The UI always shows a "Demo data: simulated positions" pill. Route savings below are measured against a naive sweep on this simulated grid, not in the field.

---

## What it does

1. **Detect:** runs YOLOv8x (MBARI `FathomNet/trash-detector`) on each frame and applies a confidence threshold.
2. **Classify:** debris is routed; marine life (fish, crab, starfish, etc.) is shown but never routed; ROV hardware is ignored.
3. **Place:** maps each detection to a 700 x 460 grid (1 unit = 0.5 m) using a simulated boustrophedon ROV track plus the bounding-box centre offset.
4. **Prioritise:** tags each pin High, Medium or Low using confidence and bounding-box size.
5. **Route:** plans an open path from the start buoy through all debris pins with nearest-neighbour + 2-opt, and reports distance saved versus a lawnmower sweep.

## Results (sample data)

22 of 30 TrashCan sample frames contained at least one trash detection (confidence >= 0.30).

| Survey  | Frames | Pins | Marine life | Optimised route | Naive sweep | Saved |
| ------- | ------ | ---- | ----------- | --------------- | ----------- | ----- |
| survey1 | 8      | 5    | 1           | 466.6 m         | 3030.6 m    | 84.6% |
| survey2 | 8      | 6    | 1           | 456.1 m         | 3030.6 m    | 85.0% |
| survey3 | 6      | 0    | 0           | n/a             | n/a         | 0%    |

survey3 has no debris at confidence >= 0.4, so the route is empty.

## Tech stack

| Layer    | Tools                                                                            |
| -------- | -------------------------------------------------------------------------------- |
| Backend  | Python, FastAPI, Uvicorn, Ultralytics YOLOv8, PyTorch, OpenCV, NumPy, SciPy      |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Lucide icons                        |
| Testing  | pytest, httpx (20 unit tests)                                                    |

## Project structure

```
aquatriage/
├── backend/
│   ├── core.py            # colour correction, inference, routing, pin building
│   ├── main.py            # FastAPI app (model loaded at startup, CORS, routes)
│   ├── models/            # MBARI YOLOv8x weights (~130 MB)
│   ├── samples/           # 30 TrashCan frames (read-only)
│   ├── samples_final/     # 6 hand-picked frames
│   ├── survey1/ survey2/ survey3/   # built by make_surveys.py
│   └── scripts/make_surveys.py
├── frontend/
│   └── public/fallback/   # pre-computed survey and route JSONs
├── design/
├── tests/test_backend.py
├── requirements.txt
└── pytest.ini
```

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Model weights placed in `backend/models/` (see [Datasets and model](#datasets-and-model))

### Backend

```bash
# from the repo root
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt

# first time only: build survey1/2/3 from backend/samples
python -m backend.scripts.make_surveys

# start the API
uvicorn backend.main:app --port 8000
```

API runs at http://localhost:8000. CORS allows `http://localhost:5173` and `http://127.0.0.1:5173`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. If the backend is not running, the UI falls back to the pre-computed JSON in `frontend/public/fallback/`.

### Tests

```bash
pytest tests/ -v
```

## API

| Method | Endpoint                                 | Purpose                                                |
| ------ | ---------------------------------------- | ------------------------------------------------------ |
| GET    | `/api/surveys`                           | List available surveys                                 |
| POST   | `/api/survey/{id}?conf=0.4&correct=true` | Run inference on every frame in a survey               |
| POST   | `/api/detect`                            | Single image upload (multipart: `image`, `conf`, `correct`) |
| POST   | `/api/route`                             | Plan an optimised route from `{start, pins}`           |

## How it works

### Class mapping

| Model class                                                                        | UI label          | Routed |
| ---------------------------------------------------------------------------------- | ----------------- | ------ |
| `trash`                                                                            | Debris (cyan pin) | Yes    |
| `rov`                                                                              | ignored           | Never  |
| fish, eel, crab, shells, plant, animal_misc, starfish, shark, ray, jellyfish, bird | Marine life (grey)| No     |

### Priority rule (`backend/core.py`)

```
High   : confidence >= 0.75 AND bbox area in the top third of survey debris
Low    : bbox area in the bottom third OR confidence < 0.5
Medium : otherwise
```

### Grid and routing

- Grid is 700 x 460 units, 1 unit = 0.5 m. Start buoy is fixed at (40, 40).
- Route is an open path from the buoy through every debris pin, built with nearest-neighbour then improved with 2-opt.
- Baseline is a boustrophedon (lawnmower) sweep with rows 60 units apart.
- `saved_pct = (naive - optimised) / naive * 100`, rounded to one decimal.

## Datasets and model

- **Sample frames:** TrashCan 1.0 (University of Minnesota).
- **Model:** `FathomNet/trash-detector` (MBARI YOLOv8x), licensed CC-BY-4.0. Used as released; no additional training was done.
- Download the weights and place the `.pt` file in `backend/models/`.

## Limitations

- Pin positions are simulated, so route distances are illustrative, not survey-grade.
- Detection quality depends on the pretrained model and on image clarity.
- Only 30 sample frames are included.

## Future work

- Use real ROV pose or GPS data in place of the simulated track.
- Support video input with frame sampling.
- Multi-vehicle route planning.

## Credits

- MBARI and FathomNet for the trash-detector model.
- University of Minnesota for the TrashCan dataset.

## Author

Ayman Shaikh · [GitHub](https://github.com/aymanchamp-sudo)
