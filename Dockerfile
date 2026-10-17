# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# Stage 1: Build the React frontend
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production Python runtime + FastAPI backend
# -----------------------------------------------------------------------------
FROM python:3.12-slim AS runner

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    HOST=0.0.0.0 \
    MPLCONFIGDIR=/tmp/matplotlib \
    YOLO_CONFIG_DIR=/tmp/ultralytics

# Install system dependencies required for OpenCV and image operations
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install CPU-only PyTorch first (keeps container image lightweight, under 600MB vs 4GB+)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install application dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, survey images, and sample data
COPY backend/ ./backend/

# Pre-download YOLOv8 MBARI weights during build so runtime cold starts are instantaneous
RUN python -m backend.scripts.download_model

# Copy compiled frontend from Stage 1 into frontend/dist for FastAPI SPA serving
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Ensure directories are writable for container runners
RUN mkdir -p /tmp/matplotlib /tmp/ultralytics && chmod -R 777 /tmp /app

# Expose server ports (7860 for Hugging Face Spaces, 10000 for Render, dynamic for Railway)
EXPOSE 7860
EXPOSE 8000

# Healthcheck for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-7860}/api/health || exit 1

# Start Uvicorn bound to 0.0.0.0 and dynamic $PORT
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]

