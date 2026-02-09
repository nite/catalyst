.PHONY: dev dev-api dev-web format format-api format-web check check-api check-web sync-api

sync-api:
	cd api && uv sync

dev:
	$(MAKE) -j2 dev-api dev-web

dev-api:
	cd api && uv sync && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-web:
	if [ ! -d web/node_modules ]; then cd web && npm install; fi
	cd web && npm run dev

format: format-api format-web

format-api:
	cd api && uv sync && uv run ruff format .

format-web:
	cd web && npx biome format --write .

check: check-api check-web

check-api:
	cd api && uv sync && uv run ruff check .

check-web:
	cd web && npx biome check .
