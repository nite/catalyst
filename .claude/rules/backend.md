---
paths:
  - "packages/**/*.py"
---

# Backend Rules (Python/FastAPI)

- Use `async def` for all route handlers
- Each app creates its own FastAPI app in `app.py`
- Use `Depends(get_current_user)` from `openaxis.core` for auth-required endpoints
- DB: SQLAlchemy async with `aiosqlite` (dev) or `asyncpg` (prod)
- No file should exceed 300 lines — split by concern
- Each app has: `app.py`, `router.py`, `models.py`, `config.py`
- Every data-fetching function should also be an MCP tool
- Every dataset should also be an MCP resource
- Financial MCP tools must include "Requires human approval" in their docstring
- Use Pydantic models for all request/response schemas
- Use `httpx.AsyncClient` for cross-app REST calls
