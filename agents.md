# OpenAxis — Agent Instructions

## Project Overview
OpenAxis is a set of composable libraries (NOT a framework). Each package is standalone and can be installed and run independently. Default stack: Python/FastAPI backend, React/Vite frontend.

## Architecture
- Monorepo with packages in `packages/`, each with its own `pyproject.toml`
- **No central shell, no node registry** — each app is fully standalone
- `openaxis-core` provides shared auth, MCP helpers, DB factory, permissions
- Each app has its own API, frontend (`web/`), database, Makefile, Dockerfile
- Cross-app communication via REST only, never shared DB
- No file should exceed 300 lines — split by concern

## Stack
- Backend: FastAPI (Python), async everywhere, SQLAlchemy (SQLite or Postgres)
- Frontend: React 19 + Vite + Tailwind CSS (per-app in `packages/{app}/web/`)
- LLM: Anthropic Claude API (claude-sonnet-4-20250514)
- State: TanStack Query for API calls

## Key Rules
- Use `async def` for all route handlers
- Use Tailwind utilities only — no custom CSS files
- Dark mode: gray-950 bg, gray-100 text, orange-500 internal, blue-500 external
- Mobile-first responsive design
- Every data-fetching function should also be an MCP tool
- Financial MCP tools must include "Requires human approval" in docstring
- Never store secrets in code — use env vars
- All cross-app data access goes through REST
- AI-proposed financial actions always require human approval
- Validate inputs at API boundaries with Pydantic

## Running
- SigWire dev: `cd packages/sigwire && make dev` (API :8001, web :3000)
- Health: `curl http://localhost:8001/health`
- Tests: `make test` or `cd packages/sigwire && make test`
- Frontend only: `cd packages/sigwire/web && npm run dev`

## Commit Convention
Format: `{package}: {what changed}`
Example: `sigwire: add Hacker News scraper`
