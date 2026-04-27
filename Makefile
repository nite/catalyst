# OpenAxis Monorepo

.PHONY: dev test test-core test-sigwire lint fmt install help

# ── Development ────────────────────────────────────────────────────────────

dev: ## Run SigWire API + web dev servers
	cd packages/sigwire && $(MAKE) dev

# ── Install ────────────────────────────────────────────────────────────────

install: ## Install all Python and Node dependencies
	uv sync --all-packages --all-extras
	cd packages/sigwire/web && npm install

# ── Tests ──────────────────────────────────────────────────────────────────

test: test-core test-sigwire ## Run all tests

test-core: ## Run openaxis-core tests
	cd packages/core && $(MAKE) test

test-sigwire: ## Run openaxis-sigwire tests
	cd packages/sigwire && $(MAKE) test

# ── Quality ────────────────────────────────────────────────────────────────

lint: ## Lint all Python packages with ruff
	uv run ruff check packages/

fmt: ## Format all Python packages with ruff
	uv run ruff format packages/

# ── Scratch ────────────────────────────────────────────────────────────────

scrape: ## Trigger a SigWire scrape (requires SigWire running)
	curl -s -X POST http://localhost:8001/scrape | python3 -m json.tool

health: ## Check SigWire health
	curl -s http://localhost:8001/health | python3 -m json.tool

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

