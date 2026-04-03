# OpenAxis — Architecture

## Monorepo Layout

```
openaxis/
├── packages/
│   ├── core/                          # openaxis-core
│   │   ├── pyproject.toml
│   │   └── openaxis/core/
│   │       ├── auth/                  # router, models, jwt, deps
│   │       ├── mcp/                   # server, decorators
│   │       ├── permissions/           # proxy, audit
│   │       ├── db.py                  # DB engine factory
│   │       └── config.py              # Env-based settings helper
│   │
│   ├── sigwire/                       # openaxis-sigwire (Signal in the Wire)
│   │   ├── pyproject.toml
│   │   └── openaxis/sigwire/
│   │       ├── app.py                 # FastAPI app (standalone entry point)
│   │       ├── router.py              # /articles, /blog, /health
│   │       ├── models.py              # Article, Source, BlogPost
│   │       ├── scraper.py             # HN, RSS scrapers
│   │       ├── ranker.py              # LLM scoring logic
│   │       ├── mcp_tools.py           # get_top_articles, search_articles
│   │       ├── db.py                  # Own DB engine + session
│   │       ├── config.py
│   │       └── manifest.json
│   │
│   ├── trader/                        # openaxis-trader
│   ├── opendata/                      # openaxis-opendata
│   ├── viz/                           # openaxis-viz
│   └── shell/                         # openaxis-shell (React/TypeScript)
│       └── src/
│           ├── modules/               # Per-Node UI components
│           │   ├── sigwire/           # FeedView, FeedItem, AdminView
│           │   ├── trader/            # DashboardView, SignalCard
│           │   ├── opendata/          # ExplorerView, DatasetCard
│           │   └── viz/               # VizView, ChartBuilder
│           ├── components/
│           │   ├── Shell.tsx           # Layout: sidebar + content area
│           │   ├── NodeWrapper.tsx     # Security/theme frame per Node
│           │   └── MobileNav.tsx
│           ├── registry.ts            # Node frontend registry
│           ├── store.ts               # Zustand shared state
│           └── api.ts                 # API client
│
├── docker-compose.yml
└── .env.example
```

## How Each Package Works Standalone

Every Node has an `app.py` that creates a fully functional FastAPI app:

```python
# packages/sigwire/openaxis/sigwire/app.py
from fastapi import FastAPI
from openaxis.sigwire.router import router
from openaxis.sigwire.db import init_db

app = FastAPI(title="Signal in the Wire", version="0.1.0")
app.include_router(router)

@app.on_event("startup")
async def startup():
    await init_db()
```

Run standalone:
```bash
cd packages/sigwire
pip install -e .
uvicorn openaxis.sigwire.app:app --port 8001
```

## How Packages Compose Together

```yaml
# docker-compose.yml
services:
  sigwire:
    build: ./packages/sigwire
    ports: ["8001:8001"]
    env_file: .env
    volumes: [sigwiredata:/app/data]

  trader:
    build: ./packages/trader
    ports: ["8002:8002"]
    env_file: .env

  shell:
    build: ./packages/shell
    ports: ["3000:3000"]
    environment:
      VITE_SIGWIRE_URL: http://localhost:8001
      VITE_TRADER_URL: http://localhost:8002
```

```bash
docker compose up           # All packages
docker compose up sigwire   # Just SigWire
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

Both work. The Node decides what it needs.

## Node Manifest

```json
{
  "node_id": "sigwire",
  "name": "Signal in the Wire",
  "version": "0.1.0",
  "description": "AI-ranked news aggregator with blog",
  "category": "Intelligence",
  "author": "openaxis-core",

  "entry_points": {
    "app": "openaxis.sigwire.app:app",
    "frontend": "FeedView.tsx"
  },

  "dependencies": [],

  "mcp": {
    "tools": ["get_top_articles", "search_articles"],
    "resources": ["openaxis://sigwire/trending"]
  },

  "permissions": {
    "requires": [],
    "grants": ["READ_ARTICLES"]
  },

  "database": {
    "env_var": "SIGWIRE_DATABASE_URL"
  },

  "standalone": true
}
```

**Categories**: `Intelligence` | `Action` | `Utility` | `Capital`

## Connectivity

### REST API

Each Node on its own port:
```
Core     :8000  — POST /auth/register, POST /auth/login, GET /auth/me
SigWire  :8001  — GET /articles, GET /articles/:id, POST /blog, GET /health
Trader   :8002  — GET /signals, GET /watchlist, POST /signals/:id/approve, GET /health
OpenData :8003  — GET /datasets, GET /datasets/:id/query, GET /health
Viz      :8004  — POST /render, GET /health
```

### MCP Gateway

`@mcp_tool` and `@mcp_resource` decorators register functions as MCP endpoints:

```python
@mcp_resource("openaxis://sigwire/trending")
async def trending_articles():
    """Returns today's top-ranked articles."""
    ...

@mcp_tool()
async def propose_trade(ticker: str, amount: float, rationale: str):
    """Propose a trade. Requires human approval to execute."""
    ...
```

AI agents (Claude, Cursor) can read feeds, query datasets, or propose trades via MCP.

### Frontend Shared State

```typescript
// Zustand store — cross-Node shared state
interface AxisState {
  currentFocus: string | null;  // e.g. "NVDA" — set by SigWire, read by Trader
  activeEvents: BusEvent[];
  user: User | null;
}
```

When a user clicks a SigWire article mentioning Nvidia, `currentFocus = "NVDA"`. Trader auto-pulls the NVDA chart. Zero coupling — just shared state.

## Design System

- **Background**: `gray-950` / **Surface**: `gray-900` / **Borders**: `gray-800`
- **Text**: `gray-100` primary, `gray-400` secondary, `gray-500` muted
- **Accent**: `orange-500` (internal), `blue-500` (external), `green-500` (safe), `red-500` (danger)
- **Font**: System stack. **Layout**: Mobile-first. **Cards**: `rounded-lg border border-gray-800`
