# OpenAxis — GitHub Copilot Instructions

## Project Overview
OpenAxis is a set of composable libraries (NOT a framework). Each package is standalone and can be installed and run independently. The default stack is Python/FastAPI backend with React/Vite frontend.

## Architecture
- Monorepo with packages in `packages/`, each with its own `pyproject.toml`
- **No central shell, no node registry** — each app is fully standalone
- `openaxis-core` provides shared auth, MCP helpers, DB factory, permissions
- Each app has its own API, frontend (`web/`), database, Makefile, Dockerfile
- Cross-app communication via REST only, never shared DB
- Directory structure supports splitting into separate repos later

## Stack
- **Backend**: FastAPI (Python), async everywhere, SQLAlchemy (SQLite or Postgres)
- **Frontend**: React 19 + Vite + Tailwind CSS (per-app in `packages/{app}/web/`)
- **LLM**: Anthropic Claude API (claude-sonnet-4-20250514)
- **State**: TanStack Query for API calls

## Coding Standards

### Python (Backend)
- Use `async def` for all route handlers
- Each app creates its own FastAPI app in `app.py`
- Use Pydantic models for all request/response schemas
- No file should exceed 300 lines — split by concern
- Each app has: `app.py`, `router.py`, `models.py`, `config.py`
- Every data-fetching function should also be an MCP tool
- Financial MCP tools must include "Requires human approval" in their docstring

### React (Frontend)
- Use Tailwind utilities only — no custom CSS files
- Dark mode: `gray-950` bg, `gray-100` text, `orange-500` internal, `blue-500` external
- Mobile-first: default styles are mobile, use `md:` and `lg:` for larger screens
- Use TanStack Query for all API calls

### Security
- Never store secrets in code — use env vars
- All cross-app data access goes through REST
- AI-proposed financial actions always require human approval
- Validate inputs at API boundaries with Pydantic
- Use parameterized queries — never string-interpolate SQL

## Running
- SigWire dev: `cd packages/sigwire && make dev` (API :8001 + web :3000)
- Tests: `make test` or `cd packages/sigwire && make test`
- Frontend only: `cd packages/sigwire/web && npm run dev`

## Commit Convention
Format: `{package}: {what changed}`
Example: `sigwire: add Hacker News scraper`
