# Backend Dockerfile (FastAPI + Uvicorn)
# Use a China-accessible mirror for Docker Hub official images
FROM docker.m.daocloud.io/library/python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first for better layer caching
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application code
COPY backend/ /app/backend/

# Ensure DB directory exists at runtime
RUN mkdir -p /app/backend/data

EXPOSE 8000

CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
