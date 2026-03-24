FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml .
COPY openaxis/ openaxis/

RUN pip install --no-cache-dir -e .

RUN mkdir -p /app/data

EXPOSE 8001

CMD ["uvicorn", "openaxis.sigwire.app:app", "--host", "0.0.0.0", "--port", "8001"]
