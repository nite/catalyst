# OpenAxis — Project Instructions

<!-- Full build spec: docs/openaxis-build-spec.md (read on demand, not imported) -->

## Quick Reference

- **Run SigWire**: `cd packages/sigwire && uvicorn openaxis.sigwire.app:app --port 8001`
- **Health check**: `curl http://localhost:8001/health`
- **Run tests**: `cd packages/sigwire && python -m pytest tests/ -v`
- **Lint**: `ruff check packages/`
- **Format**: `ruff format packages/`
- **Frontend dev**: `cd frontend && npm run dev`

## Architecture

- Monorepo: each Node in `packages/{node_id}/` with its own `pyproject.toml`
- Nodes are standalone FastAPI apps — never import across Nodes
- Cross-Node communication via REST only
- `openaxis-core` (future) provides shared auth, audit log, permissions
- Each Node owns its own DB (or none)

## Commit Convention

Format: `{package}: {what changed}`
Example: `sigwire: add Hacker News scraper`

## Current State

- **SigWire** (`packages/sigwire/`): News aggregator with HN scraper, AI ranker, FastAPI REST API
- **Frontend** (`frontend/`): React 19 + Vite + Tailwind CSS shell (in progress)
- **Legacy dirs** (`api/`, `backend/`): Old scaffolding, will be removed
