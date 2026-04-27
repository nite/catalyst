# SigWire — AI-ranked news aggregator

.PHONY: dev api web test install build lint fmt help

# ── Development ────────────────────────────────────────────────────────────

dev: ## Run API + web dev servers in parallel
	@trap 'kill 0' INT TERM; \
	$(MAKE) api & \
	$(MAKE) web & \
	wait

api: ## Run FastAPI backend (port 8001)
	uv run uvicorn openaxis.sigwire.app:app --port 8001 --reload

web: ## Run Vite dev server (port 3000)
	cd web && npm run dev

# ── Install ────────────────────────────────────────────────────────────────

install: ## Install all Python and Node dependencies
	uv sync
	cd web && npm install

# ── Build ──────────────────────────────────────────────────────────────────

build: ## Build web frontend for production
	cd web && npm run build

# ── Tests ──────────────────────────────────────────────────────────────────

test: ## Run Python tests
	uv run pytest tests/ -v

# ── Quality ────────────────────────────────────────────────────────────────

lint: ## Lint Python code with ruff
	uv run ruff check .

fmt: ## Format Python code with ruff
	uv run ruff format .

# ── Scratch ────────────────────────────────────────────────────────────────

scrape: ## Trigger a scrape (requires API running)
	curl -s -X POST http://localhost:8001/scrape | python3 -m json.tool

health: ## Check API health
	curl -s http://localhost:8001/health | python3 -m json.tool

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
