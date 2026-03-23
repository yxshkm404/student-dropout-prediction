# ── Flask ML Service ──────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Slow/unstable networks to PyPI cause ReadTimeoutError during image build; relax pip limits.
ENV PIP_DEFAULT_TIMEOUT=300

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --default-timeout=300 --retries 10 -r requirements.txt

# Copy application code and model data
COPY app.py .
COPY data/ data/

EXPOSE 5000

# Run with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "app:app"]
