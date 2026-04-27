FROM python:3.13-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy package files
COPY pyproject.toml .
COPY openaxis/ openaxis/
COPY prompts/ prompts/

# Install sigwire and all its dependencies
RUN uv pip install --system --no-cache -e .

RUN mkdir -p /app/data

EXPOSE 8001

CMD ["uvicorn", "openaxis.sigwire.app:app", "--host", "0.0.0.0", "--port", "8001"]
