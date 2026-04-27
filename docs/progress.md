# OpenAxis — Build Progress

> Library + standalone apps architecture

## What's Built

| Package | What | Tests |
|---------|------|-------|
| `packages/core` | `openaxis-core` — Auth, MCP helpers, DB factory, permissions/audit | 15 passing |
| `packages/sigwire` | AI-ranked news aggregator (API + web frontend) | 10 passing |

## Package Details

### Core (`packages/core/`)

Utility library — not a running service. Provides:
- **Auth**: JWT (HS256), bcrypt passwords, roles (admin/user/viewer/api_consumer)
- **MCP**: `@mcp_tool` / `@mcp_resource` decorators + HTTP router
- **DB**: Async SQLAlchemy engine factory
- **Permissions**: `@require_permission` decorator + audit logging

### SigWire (`packages/sigwire/`)

Standalone app — AI-ranked news aggregator:
- **API**: FastAPI backend (port 8001) — HN scraper, RSS feeds, Claude ranker, blog posts
- **Web**: React 19 + Vite + Tailwind frontend (port 3000) — feed view, admin, about
- **Prompt**: Configurable ranking prompt via `prompts/ranking.md` or `RANKING_PROMPT_FILE` env var
- **MCP**: Optional — install `openaxis-sigwire[mcp]` to enable `get_top_articles`, `search_articles`

## Architecture Changes

The original implementation used a central "Shell" React app that loaded "Node" UI modules from a registry. This was replaced with:

- **Each app has its own frontend** in `packages/{app}/web/`
- **No central shell, no node registry, no shared state**
- **Apps compose over REST** — no shared imports or DB
- **Docker is for deployment only** — local dev runs natively via Makefiles

Deleted: `packages/shell/`, `frontend/`, `backend/`, `api/`, `web/`

## Verification

```bash
make test                              # 25 tests (15 core + 10 sigwire)
cd packages/sigwire && make dev        # API :8001 + web :3000
cd packages/sigwire && docker compose up  # containerised
```

## Port Map

| Service | Port | Command |
|---------|------|---------|
| SigWire API | 8001 | `cd packages/sigwire && make api` |
| SigWire Web | 3000 | `cd packages/sigwire && make web` |
