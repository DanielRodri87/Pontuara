FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY . /app

RUN if [ -f requirements.txt ]; then \
      pip install --no-cache-dir -r requirements.txt; \
    fi

EXPOSE 8000

CMD ["sh", "-c", "if python -c 'import uvicorn' >/dev/null 2>&1 && [ -f app/main.py ]; then uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload; else python -m http.server 8000; fi"]
