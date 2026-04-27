# OpenAxis — Architecture

## Monorepo Layout

```
openaxis/
├── packages/
│   ├── core/                          # openaxis-core (library)
│   │   ├── pyproject.toml
│   │   ├── Makefile
│   │   └── openaxis/core/
│   │       ├── auth/                  # router, models, jwt, deps
│   │       ├── mcp/                   # decorators, registry, router
│   │       ├── permissions/           # audit, decorators
│   │       ├── db.py                  # DB engine factory
│   │       └── config.py              # Env-based settings helper
│   │
│   └── sigwire/                       # openaxis-sigwire (Signal in the Wire)
│       ├── pyproject.toml
│       ├── Makefile
│       ├── Dockerfile                 # API container
│       ├── docker-compose.yml
│       ├── prompts/
│       │   └── ranking.md             # Default LLM ranking prompt
│       ├── openaxis/sigwire/
│       │   ├── app.py                 # FastAPI app (standalone entry point)
│       │   ├── router.py              # /articles, /blog, /health
│       │   ├── models.py              # Article, Source, BlogPost
│       │   ├── scraper.py             # HN, RSS scrapers
│       │   ├── ranker.py              # LLM scoring (loads prompt from file)
│       │   ├── mcp_tools.py           # get_top_articles, search_articles
│       │   ├── db.py                  # Own DB engine + session
│       │   └── config.py
│       └── web/                       # SigWire frontend
│           ├── Dockerfile             # nginx container
│           ├── package.json
│           ├── vite.config.ts
│           └── src/
│               ├── App.tsx
│               ├── api.ts             # API client
│               ├── components/        # FeedItem, FeedFilters, etc.
│               ├── hooks/             # useArticles, useBlogPosts
│               └── pages/             # FeedView, AdminView, AboutView
│
├── docker-compose.yml                 # Root convenience compose
└── .env.example
```

## Design Principles

- **Library, not framework**: `openaxis-core` provides utilities you import. It never runs as a service.
- **Standalone apps**: Each app (SigWire, future Catalyst, etc.) has its own API, frontend, database, and deployment.
- **No central registry**: Apps don't know about each other at build time. They compose over REST at runtime if needed.
- **Each app independently deployable**: Own Dockerfile, own docker-compose, deployable to Koyeb or anywhere.
- **Separate repos eventually**: Directory structure supports splitting into separate repositories later.

## How Each App Works Standalone

Every app has an `app.py` that creates a fully functional FastAPI app:

```python
# packages/sigwire/openaxis/sigwire/app.py
from fastapi import FastAPI
from openaxis.sigwire.router import router
from openaxis.sigwire.db import init_db

app = FastAPI(title="Signal in the Wire", version="0.1.0")
app.include_router(router)
```

Run standalone:
```bash
cd packages/sigwire
make dev    # API on :8001, web on :3000
```

## How Apps Compose

Apps communicate over REST. No shared imports, no shared database.

```yaml
# packages/sigwire/docker-compose.yml
services:
  api:
    build: .
    ports: ["8001:8001"]
  web:
    build: ./web
    ports: ["3000:80"]
```

```bash
docker compose up
```

## Optional Dependency on Core

```python
# WITH openaxis-core — get auth for free
from openaxis.core.auth import get_current_user
@router.post("/blog")
async def create_post(payload: BlogPostCreate, user=Depends(get_current_user)):
    return await save_post(payload, user.id)

# WITHOUT openaxis-core — fully standalone
@router.post("/blog")
async def create_post(payload: BlogPostCreate):
    return await save_post(payload)
```

Both work. The app decides what it needs.

## MCP

`@mcp_tool` and `@mcp_resource` decorators register functions as MCP endpoints:

```python
@mcp_resource("openaxis://sigwire/trending")
async def trending_articles():
    """Returns today's top-ranked articles."""
    ...
```

AI agents (Claude, Cursor) can read feeds, query datasets, or propose trades via MCP.

## Design System

- **Background**: `gray-950` / **Surface**: `gray-900` / **Borders**: `gray-800`
- **Text**: `gray-100` primary, `gray-400` secondary, `gray-500` muted
- **Accent**: `orange-500` (internal), `blue-500` (external), `green-500` (safe), `red-500` (danger)
- **Font**: System stack. **Layout**: Mobile-first. **Cards**: `rounded-lg border border-gray-800`
