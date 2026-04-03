# OpenAxis — Agent Instructions

## Project Overview
OpenAxis is a set of composable libraries (NOT a framework). Each package is standalone and can be installed and run independently. Default stack: Python/FastAPI backend, React/Vite frontend.

## Architecture
- Monorepo with Nodes in `packages/{node_id}/`, each with its own `pyproject.toml`
- Nodes are standalone FastAPI apps — never import across Nodes
- Cross-Node communication via REST only, never shared DB
- Each Node has: `app.py`, `router.py`, `manifest.json`, `models.py`, `config.py`
- No file should exceed 300 lines — split by concern

## Stack
- Backend: FastAPI (Python), async everywhere, SQLAlchemy (SQLite or Postgres)
- Frontend: React 19 + Vite + Tailwind CSS
- LLM: Anthropic Claude API (claude-sonnet-4-20250514)
- State: TanStack Query for API calls, Zustand for cross-Node state

## Key Rules
- Use `async def` for all route handlers
- Wrap all Node views in `<NodeWrapper>`
- Use Tailwind utilities only — no custom CSS files
- Dark mode: gray-950 bg, gray-100 text, orange-500 internal, blue-500 external
- Mobile-first responsive design
- Every data-fetching function should also be an MCP tool
- Financial MCP tools must include "Requires human approval" in docstring
- Never store secrets in code — use env vars
- All cross-Node data access goes through REST
- AI-proposed financial actions always require human approval
- Validate inputs at API boundaries with Pydantic

## Running
- SigWire: `cd packages/sigwire && uvicorn openaxis.sigwire.app:app --port 8001`
- Health: `curl http://localhost:8001/health`
- Tests: `cd packages/sigwire && python -m pytest tests/ -v`
- Frontend: `cd frontend && npm run dev`

## Commit Convention
Format: `{package}: {what changed}`
Example: `sigwire: add Hacker News scraper`
