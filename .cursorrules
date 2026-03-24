# OpenAxis — AI Coding Rules

## Philosophy
- OpenAxis is a set of composable libraries, NOT a framework.
- Each package is standalone. Each can be installed and run independently.
- Default stack: Python/FastAPI backend, React/Vite frontend. But Nodes can be any language.
- Follow "No Plan Mode": build what works, refactor later.
- Mobile-first, responsive. Dark mode default.

## Stack (Default)
- Backend: FastAPI (Python), async everywhere
- Frontend: React 19 + Vite + Tailwind CSS
- DB: SQLAlchemy (SQLite or Postgres). One DB per package, or none.
- LLM: Anthropic Claude API (claude-sonnet-4-20250514)

## Package Rules
- Each Node lives in packages/{node_id}/ with its own pyproject.toml
- Each Node has its own app.py, router.py, manifest.json at minimum
- Database is optional. If a Node needs persistence, it owns its own DB.
- openaxis-core has its own database for users, audit log, permissions
- Nodes NEVER share storage
- Nodes NEVER import from other Nodes — use REST calls
- Nodes MAY import from openaxis-core (optional dependency)
- No file should exceed 300 lines — split by concern

## Backend Rules
- Use async def for all route handlers
- Each Node creates its own FastAPI app in app.py
- Use Depends(get_current_user) from openaxis.core for auth-required endpoints
- All financial actions must go through the Constitutional Gatekeeper

## Frontend Rules
- Wrap all Node views in <NodeWrapper>
- Use Tailwind utilities only. No custom CSS files.
- Dark mode: gray-950 bg, gray-100 text, orange-500 internal, blue-500 external
- Mobile-first: default styles are mobile. Use md: and lg: for larger screens.
- Use TanStack Query for all API calls
- Use Zustand store for cross-Node shared state

## MCP Rules
- Every data-fetching function should also be an MCP tool
- Every dataset should also be an MCP resource
- Financial MCP tools must include "Requires human approval" in their docstring

## Security
- Never store secrets in code. Use env vars.
- All cross-Node data access goes through REST, never shared DB
- AI-proposed financial actions always require human approval
- Log everything via openaxis.core.permissions.log_action

## Commit Convention
- Format: {package}: {what changed}
- Example: "sigwire: add Hacker News scraper"

## Running
- SigWire standalone: `cd packages/sigwire && uvicorn openaxis.sigwire.app:app --port 8001`
- Health check: `curl http://localhost:8001/health`
