.PHONY: dev dev-backend dev-frontend

dev:
	$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	if [ ! -d frontend/node_modules ]; then cd frontend && npm install; fi
	cd frontend && npm run dev
