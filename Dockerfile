# ── Stage 1: Build frontend ───────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

COPY backend/pyproject.toml ./
RUN pip install --no-cache-dir .

COPY backend/app ./app
COPY --from=frontend-build /app/frontend/dist ./static

VOLUME /app/data
ENV DATABASE_URL=sqlite:////app/data/app.db

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
