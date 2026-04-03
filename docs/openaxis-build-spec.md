# OpenAxis — Complete Build Specification
### v0.1.0-genesis | The Sovereign Agentic Platform

> A set of composable libraries that let you build, connect, and deploy intelligent web apps. Import what you need. Run each piece standalone or together. No framework lock-in.

---

## The Pitch

Build and deploy full-stack web apps for free, with AI. Like what Vercel, Lovable, Bolt, Replit, and v0 promise — but without the lock-in, without the serverless limitations, and with something none of them offer: every app you build can be talked to by AI agents and can talk to every other app.

**The experience is the same as those tools.** Use OpenAxis Studio in the browser — or open Cursor / Claude Code locally if you're a dev and want to go deeper. Describe an app, the AI scaffolds it, deploy with a click or a git push to Render or Koyeb. You're live. Free. Studio and local tools work with the same libraries, same projects, same deploy targets — start in one, switch to the other anytime.

**What you get that they don't:**
- Real backends (not serverless functions), real persistent storage, real APIs
- Every app is automatically MCP-queryable — Claude, ChatGPT, or any agent can talk to it
- Apps share data with each other over REST and MCP — build a news feed, a weather app, a BI tool, and they compose into something bigger
- Open source, deploy anywhere — not trapped on one platform's infra
- **Coming: OpenAxis Studio** — a web app that matches Lovable/Replit for UX. Describe an app, see the code, click deploy. But everything it builds is a standard app you own. Eject to Cursor or Claude Code anytime.

**OpenAxis** — the open axis that everything connects through — is the composable library set that makes this work. Default stack: Python/FastAPI + React/Vite. Any language works if it exposes REST.

**OpenAxis is its own first user.** The project's own website is an OpenAxis node — a deployed web app with a pitch page, API docs, and an MCP server. Developers can use the OpenAxis MCP to scaffold new apps, submit plugins (new auth providers, payment integrations, data connectors), and push pull requests back to the core — all from within their AI coding tool. Every feature anyone builds can flow back to the platform.

**Launch apps** (each built and deployed in a day, each works alone, all talk to each other):

- **Signal in the Wire (SigWire)** — AI-ranked news feed. LLM scores articles by depth, impact, novelty. Ask Claude: "what are today's top AI stories?" and it reads your feed via MCP.
- **MeanSky** — the *mean* of the sky. 8 weather models averaged into one forecast. Already live. Retrofitting as an OpenAxis node.
- **Open Data Explorer** — public datasets (FRED, SEC, data.gov). Every dataset is an MCP resource AI agents can query directly.
- **GenBI Viz** — BI / analytics tool. Traditional charting first, GenBI layer on top. Every chart is embeddable and MCP-callable.

---

## 0. Build Philosophy & Development Rules

### Libraries, Not a Framework

OpenAxis is **not** a framework. It's a set of libraries that compose.

| Framework (what we're NOT) | Library (what we ARE) |
|---|---|
| "Put your code in our folders" | "Import our code into your project" |
| You conform to our structure | You stay in control of your structure |
| The framework calls your code | Your code calls the library |
| All-or-nothing adoption | Pick and choose what you need |
| Delete the framework, rewrite everything | Delete one library, everything else still works |

**Practical consequence**: A developer should be able to `pip install openaxis-core` and get auth + MCP helpers without adopting anything else. Westy should be able to build his Stock Correlations app as a normal FastAPI app and just `from openaxis.core import auth` to get login/signup for free.

**Every library is a separate package.** Each can be published to PyPI / npm independently. Each has its own repo (or monorepo subfolder). Each works standalone.

**The default stack is Python/FastAPI backend and React/Vite frontend**, but the architecture is language-agnostic — any Node just needs to expose REST and optionally MCP.

### "No Plan Mode"

1. **Start with one working thing.** Don't design a "platform" — start with a single script that does one thing well. Everything else grows from that.
2. **Conversational architecture.** Describe what you want to an AI coding agent in plain English. Let the code emerge from the conversation.
3. **Ship ugly, ship fast.** The first version will look rough. That's fine — ship because it *works*, not because it's polished.
4. **Let the community define the roadmap.** Features you didn't plan will get demanded. Build them when they're demanded.
5. **The "vibe" is the product.** The README, the demo video, the name — these matter as much as the code.

**This spec is a compass, not a blueprint.** It tells the AI agent *what* we're building and *why*. The *how* emerges from vibe-coding sessions.

### Terminology

- **openaxis-core** — the shared library: auth, MCP helpers, permissions, config
- **Node** — an independent app that optionally uses openaxis-core. Each Node is its own library/package.
- **Shell** — the React frontend library that provides a UI shell for loading Nodes

### The 7 Hard Rules (Non-Negotiable)

**Rule 1: Each Node Is Its Own Package.**
Every Node is a standalone package with its own `pyproject.toml` (or equivalent), its own dependencies, its own storage (if any). It can be installed and run independently. It MAY depend on `openaxis-core` but it doesn't have to.

**Rule 2: Nodes Talk Through REST or MCP — Never Direct Imports.**
If the Trader needs articles from SigWire, it calls the SigWire REST API. It does NOT import SigWire's internals.

**Rule 3: If a Node Has Storage, It Owns That Storage.**
Not every Node needs a database. If a Node does need persistence, it owns its own storage. Nodes never share storage.

**Rule 4: Every Node Has a Health Endpoint.**

**Rule 5: Config Comes From Environment Variables Only.**

**Rule 6: Commit Messages Describe What Changed.** Format: `{package}: {what changed}`

**Rule 7: No God Files.** No file over ~300 lines. Split by concern.

**Rule 8: No Backwards Compatibility. Always an Upgrade Path.**
There is one version: the latest. No deprecation paths, no legacy support, no "v1 still works." Every breaking release ships with an upgrade script that migrates from the previous version. AI agents (Cursor, Claude Code) can run these automatically. This keeps the codebase lean and lets us move fast — users aren't stuck, they just upgrade.

### Soft Practices

**Smoke Test After Every Session:**
```bash
uvicorn openaxis_sigwire.app:app --port 8001
curl http://localhost:8001/health
```

**Tests for the Scary Parts Only:** LLM response parsing, Gatekeeper rule enforcement, auth token validation.

**Keep a CHANGELOG per package.** Append-only. Date + what shipped.

**The "Fresh Agent" Test:** Every few days, open a new AI chat. Paste this spec + current file tree. Ask: "What does this project do?" If it's confused, your structure has drifted.

### Vibe-Coding Session Template

```
1. DECIDE (30 sec)    — What's the ONE thing I'm building this session?
2. CONTEXT (2 min)    — Paste the target package files into the AI agent
3. BUILD (30-90 min)  — Let the AI generate. Run it. Fix it. Iterate.
4. SMOKE TEST (2 min) — Does the package start standalone? Health check?
5. COMMIT (1 min)     — git commit -m "sigwire: add HN scraper"
6. CHANGELOG (30 sec) — Append one line
7. STOP or LOOP
```

---

## 1. What We're Building

**OpenAxis** is a set of composable libraries where:

- Each library is an independent app ("Node") that works standalone
- Libraries can optionally compose together via a shared core (auth, MCP)
- AI agents can interact with any Node via MCP
- Each Node deploys independently — on Render, Koyeb, K8s, or anything else
- Nothing is locked in. Every API is open. Every piece is replaceable.
- Default stack is Python/FastAPI + React/Vite, but any Node can be any language

**The libraries:**

| Package | What It Does | Standalone? |
|---------|-------------|-------------|
| `openaxis-core` | Auth, MCP helpers, permissions, config | Yes (shared utility library) |
| `openaxis-mcp` | Decorators to expose any function as an MCP tool/resource | Yes (standalone MCP helper) |
| `openaxis-sigwire` | **Signal in the Wire** — AI-ranked news aggregator with blog | Yes (full app) |
| `openaxis-meansky` | **MeanSky** — 8-model weather ensemble (retrofit of existing app) | Yes (already live) |
| `openaxis-trader` | Trading engine using news intelligence + technicals | Yes (full app) |
| `openaxis-opendata` | Public dataset browser and query engine | Yes (full app) |
| `openaxis-viz` | BI / analytics tool with GenBI layer | Yes (full app) |
| `openaxis-shell` | React UI that can load any Node's frontend | Yes (standalone React app) |

**All work alone. All work better together.**

### Product Names

| Full Name | Short Name | What |
|-----------|-----------|------|
| **Signal in the Wire** | **SigWire** | The news aggregator — first app, ships first |
| **OpenAxis** | — | The platform / library ecosystem (working name) |

---

## 2. Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Backend** | FastAPI (Python) | Async-native, trivial MCP integration, auto-generated OpenAPI docs |
| **Frontend** | React 19 + Vite + Tailwind CSS | Fast builds, mobile-first, massive ecosystem |
| **Database** | SQLite / PostgreSQL / none | Per-Node choice. Some Nodes need persistence, some don't. |
| **DB Architecture** | Each Node owns its own storage (if any) | True isolation — delete a Node, nothing else notices |
| **Cache / Event Bus** | Redis (Phase 5+) | Pub/sub for inter-Node events — not needed for launch apps which use REST |
| **Secrets** | Environment variables (MVP) → HashiCorp Vault (production) | Pragmatic security escalation |
| **LLM** | Anthropic Claude API (claude-sonnet-4-20250514) | For article ranking, trade thesis generation, chart suggestions |
| **State Management** | Zustand (frontend) | Lightweight shared state across Nodes |
| **Data Fetching** | TanStack Query (frontend) | Caching, background refetch, loading states |

### What We're NOT Using (Yet)
- No PostgreSQL in Phase 1 (SQLite is zero-config where you need persistence; upgrade to Postgres when you need concurrent users; some Nodes won't need a DB at all)
- No GraphQL (REST + MCP is enough for v0.1; GraphQL is a v0.3 consideration)
- No gRPC (future consideration for high-frequency inter-service calls)
- No MongoDB (SQLite/PostgreSQL handles everything; add document stores per-Node if needed later)
- No Kubernetes (Render/Koyeb first; Helm charts come when there's demand)

---

## 3. Package Structure

### Monorepo Layout

```
openaxis/
├── packages/
│   ├── core/                          # openaxis-core
│   │   ├── pyproject.toml
│   │   ├── openaxis/
│   │   │   └── core/
│   │   │       ├── __init__.py        # Public API: from openaxis.core import auth, config
│   │   │       ├── auth/
│   │   │       │   ├── __init__.py    # Exports: router, get_current_user, create_user
│   │   │       │   ├── router.py      # /auth/register, /auth/login, /auth/me
│   │   │       │   ├── models.py      # User table
│   │   │       │   ├── jwt.py         # Token creation & validation
│   │   │       │   └── deps.py        # get_current_user FastAPI dependency
│   │   │       ├── mcp/
│   │   │       │   ├── __init__.py    # Exports: mcp_tool, mcp_resource
│   │   │       │   ├── server.py      # MCP server setup
│   │   │       │   └── decorators.py  # @mcp_tool, @mcp_resource decorators
│   │   │       ├── permissions/
│   │   │       │   ├── proxy.py       # Cross-Node access control
│   │   │       │   └── audit.py       # Immutable action log
│   │   │       ├── db.py              # DB engine factory: create_db(env_var) → engine + session
│   │   │       └── config.py          # Env-based settings helper
│   │   └── tests/
│   │
│   ├── sigwire/                       # openaxis-sigwire (Signal in the Wire)
│   │   ├── pyproject.toml             # depends on: openaxis-core (optional)
│   │   ├── openaxis/
│   │   │   └── sigwire/
│   │   │       ├── __init__.py
│   │   │       ├── app.py             # FastAPI app (standalone entry point)
│   │   │       ├── db.py              # Own DB engine + session
│   │   │       ├── router.py          # /articles, /blog, /health
│   │   │       ├── models.py          # Article, Source, BlogPost tables
│   │   │       ├── scraper.py         # HN, RSS, Substack scrapers
│   │   │       ├── ranker.py          # LLM scoring logic
│   │   │       ├── mcp_tools.py       # get_top_articles, search_articles
│   │   │       └── manifest.json      # Node manifest
│   │   └── tests/
│   │
│   ├── trader/                        # openaxis-trader
│   │   ├── pyproject.toml             # depends on: openaxis-core (optional)
│   │   ├── openaxis/
│   │   │   └── trader/
│   │   │       ├── __init__.py
│   │   │       ├── app.py             # FastAPI app (standalone entry point)
│   │   │       ├── db.py              # Own DB engine + session
│   │   │       ├── router.py          # /signals, /watchlist, /positions, /health
│   │   │       ├── models.py          # Signal, Position, Watchlist tables
│   │   │       ├── analyzer.py        # Technical analysis (RSI, MACD, etc.)
│   │   │       ├── thesis.py          # LLM trade thesis generation
│   │   │       ├── gatekeeper.py      # Constitutional safety checks
│   │   │       ├── mcp_tools.py       # propose_trade, get_signals
│   │   │       └── manifest.json
│   │   └── tests/
│   │
│   ├── opendata/                      # openaxis-opendata
│   │   ├── pyproject.toml
│   │   ├── openaxis/
│   │   │   └── opendata/
│   │   │       ├── __init__.py
│   │   │       ├── app.py
│   │   │       ├── db.py
│   │   │       ├── router.py
│   │   │       ├── models.py          # Dataset, DataPoint tables
│   │   │       ├── connectors/        # data.gov, FRED, SEC, etc.
│   │   │       ├── mcp_tools.py
│   │   │       └── manifest.json
│   │   └── tests/
│   │
│   ├── viz/                           # openaxis-viz
│   │   ├── pyproject.toml
│   │   ├── openaxis/
│   │   │   └── viz/
│   │   │       ├── __init__.py
│   │   │       ├── app.py
│   │   │       ├── router.py
│   │   │       ├── chart_engine.py    # Chart rendering + GenBI layer
│   │   │       ├── connectors.py      # Fetch data from other Nodes / URLs
│   │   │       ├── mcp_tools.py
│   │   │       └── manifest.json
│   │   └── tests/
│   │
│   └── shell/                         # openaxis-shell (React/TypeScript)
│       ├── package.json
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── registry.ts            # Node frontend registry
│       │   ├── store.ts               # Zustand shared state
│       │   ├── api.ts                 # API client (fetch wrapper)
│       │   ├── components/
│       │   │   ├── Shell.tsx           # Layout: sidebar + content area
│       │   │   ├── NodeWrapper.tsx     # Security/theme frame per Node
│       │   │   ├── MobileNav.tsx
│       │   │   └── EventToast.tsx
│       │   ├── modules/
│       │   │   ├── sigwire/
│       │   │   │   ├── FeedView.tsx
│       │   │   │   ├── FeedItem.tsx
│       │   │   │   ├── AdminView.tsx
│       │   │   │   └── ReaderView.tsx
│       │   │   ├── trader/
│       │   │   │   ├── DashboardView.tsx
│       │   │   │   ├── SignalCard.tsx
│       │   │   │   └── WatchlistView.tsx
│       │   │   ├── opendata/
│       │   │   │   ├── ExplorerView.tsx
│       │   │   │   └── DatasetCard.tsx
│       │   │   └── viz/
│       │   │       ├── VizView.tsx
│       │   │       └── ChartBuilder.tsx
│       │   └── hooks/
│       │       ├── useAuth.ts
│       │       └── useEventBus.ts
│       ├── index.html
│       ├── vite.config.ts
│       └── tailwind.config.ts
│
├── docker-compose.yml                 # Runs all packages together for local dev
├── .cursorrules                       # AI coding standards
├── CLAUDE.md                          # Same rules for Claude Code
├── .env.example
├── CHANGELOG.md
└── README.md
```

### How Each Package Works Standalone

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

Run it alone:
```bash
cd packages/sigwire
pip install -e .
uvicorn openaxis.sigwire.app:app --port 8001
```

### How Packages Compose Together

```yaml
# docker-compose.yml — runs everything together
services:
  core:
    build: ./packages/core
    ports: ["8000:8000"]
    env_file: .env
    volumes: [coredata:/app/data]

  sigwire:
    build: ./packages/sigwire
    ports: ["8001:8001"]
    env_file: .env
    volumes: [sigwiredata:/app/data]

  trader:
    build: ./packages/trader
    ports: ["8002:8002"]
    env_file: .env
    volumes: [traderdata:/app/data]

  shell:
    build: ./packages/shell
    ports: ["3000:3000"]
    environment:
      VITE_CORE_URL: http://localhost:8000
      VITE_SIGWIRE_URL: http://localhost:8001
      VITE_TRADER_URL: http://localhost:8002

  # Redis — only needed from Phase 5+ when event bus is added
  # redis:
  #   image: redis:7-alpine
  #   ports: ["6379:6379"]

volumes:
  coredata:
  sigwiredata:
  traderdata:
```

```bash
docker compose up           # All packages running, each with its own port
docker compose up sigwire   # Just SigWire
```

### What "Optional Dependency on Core" Means

```python
# WITH openaxis-core — get auth for free
from openaxis.core.auth import get_current_user
@router.post("/blog")
async def create_post(payload: BlogPostCreate, user=Depends(get_current_user)):
    post = await save_post(payload, user.id)
    return post

# WITHOUT openaxis-core — fully standalone
@router.post("/blog")
async def create_post(payload: BlogPostCreate):
    post = await save_post(payload)
    return post
```

Both work. The Node decides what it needs.

---

## 4. The openaxis-core Library

### 4.1 What It Exports

```python
# Auth
from openaxis.core.auth import router as auth_router
from openaxis.core.auth import get_current_user
from openaxis.core.auth import create_user, verify_token

# MCP
from openaxis.core.mcp import mcp_tool, mcp_resource
from openaxis.core.mcp import create_mcp_server

# Database
from openaxis.core.db import create_db

# Config
from openaxis.core.config import get_setting

# Permissions
from openaxis.core.permissions import require_permission
from openaxis.core.permissions import log_action

# Event Bus (Phase 5+ — not needed for launch)
# from openaxis.core.bus import EventBus, emit, subscribe, CHANNELS
```

### 4.2 Auth

- JWT-based with access + refresh tokens
- OAuth2 providers (Google, GitHub) via `authlib`
- API keys for programmatic access
- RBAC: `admin`, `user`, `viewer`, `api_consumer`
- Core has its own database for users + sessions

### 4.3 Event Bus (Phase 5+)

Redis pub/sub for real-time inter-Node communication. **Not needed for launch apps** — SigWire, MeanSky, Open Data, and Viz all work via REST request/response. The bus becomes useful when a Node needs to react to events in real-time (e.g., Trader auto-responding to high-scoring news articles).

Until then, polling works fine: the Trader can check SigWire's API every few minutes instead of subscribing to a push event.

```python
# Channel constants (for when the bus is needed)
CHANNELS = {
    "NEWS_FLASH": "openaxis:news_flash",
    "ARTICLE_RANKED": "openaxis:article_ranked",
    "TRADE_SIGNAL": "openaxis:trade_signal",
    "TRADE_PROPOSAL": "openaxis:trade_proposal",
    "DATA_UPDATE": "openaxis:data_update",
    "ALERT": "openaxis:alert",
}
```

### 4.4 MCP Helpers

Decorators that turn any function into an MCP tool or resource:

```python
from openaxis.core.mcp import mcp_tool, mcp_resource

@mcp_resource("openaxis://sigwire/trending")
async def trending_articles():
    """Returns today's top-ranked articles."""
    ...

@mcp_tool()
async def propose_trade(ticker: str, amount: float, rationale: str):
    """Propose a trade. Requires human approval to execute."""
    ...
```

### 4.5 Database Factory

```python
from openaxis.core.db import create_db
engine, SessionLocal = create_db("SIGWIRE_DATABASE_URL")
```

Works with SQLite or PostgreSQL. The Node doesn't care which.

### 4.6 Audit Trail

Logs to Core's own database:

```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    target_node TEXT NOT NULL,
    payload JSONB,
    result TEXT,
    gatekeeper_verdict JSONB
);
```

---

## 5. The Node Manifest

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

  "events": {
    "emits": ["NEWS_FLASH", "ARTICLE_RANKED"],
    "subscribes": []
  },

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

---

## 6. Connectivity

### 6.1 REST API

Each Node exposes its own REST API on its own port:

```
# Core (port 8000)
POST /auth/register
POST /auth/login
GET  /auth/me

# SigWire (port 8001)
GET  /articles
GET  /articles/:id
POST /blog
GET  /health

# Trader (port 8002)
GET  /signals
GET  /watchlist
POST /signals/:id/approve
GET  /health

# Open Data (port 8003)
GET  /datasets
GET  /datasets/:id/query
GET  /health

# Viz (port 8004)
POST /render
GET  /health
```

### 6.2 MCP Gateway

Each Node can expose its own MCP server. The `@mcp_tool` and `@mcp_resource` decorators from `openaxis-core` handle registration.

Claude, Cursor, or any MCP-compatible agent can:
- **Read** the news feed via `openaxis://sigwire/trending`
- **Query** open datasets via `openaxis://opendata/datasets/{id}`
- **Propose** trades via the `propose_trade` tool
- **Generate** visualizations via the `generate_chart` tool

### 6.3 Webhooks

Any event can trigger an outbound webhook:

```json
{
  "event": "TRADE_PROPOSAL",
  "url": "https://hooks.slack.com/services/...",
  "method": "POST"
}
```

### 6.4 Future Protocols

| Protocol | When | Why |
|----------|------|-----|
| WebSockets | v0.2 | Real-time streaming for trading dashboards |
| GraphQL | v0.3 | Complex cross-Node queries |
| gRPC | v0.4 | High-performance inter-service calls at scale |

---

## 7. Deployment

### Principle: Build Locally, Deploy Anywhere

OpenAxis apps are built on your machine using whatever AI coding tool you prefer (Cursor, Claude Code, Windsurf, etc.) and deployed with a git push. You are never locked into a platform's hosting or pushed toward a specific provider.

**Why not Vercel/Netlify?** They're frontend-first, built around serverless. FastAPI backends need persistent processes, persistent disks (for SQLite), WebSocket support, and no cold starts. Wrong tool for this stack.

**Why not Replit/Lovable/Bolt/v0?** They're browser-based builders that push you toward their own hosting or Vercel. Coupling your dev tool to your deploy target is exactly the lock-in OpenAxis avoids. Use local AI tools (Cursor, Claude Code, Windsurf) instead — they generate code you own and deploy wherever you want.

**Why Render and Koyeb?** Both have free tiers that work for real apps. Both deploy from a git push. Both support Python web services natively. Both provide persistent disks. Both have config formats simple enough that an AI coding agent can generate them in one pass. They're the only two platforms that tick every box for this stack.

**But it's just a Python app.** Railway and Fly.io will also work (no provided configs, but straightforward). So will DigitalOcean, AWS, bare metal, K8s, or anything else that runs Python. Render and Koyeb are the first-class targets with configs in the repo. Everything else is "it'll work, figure it out."

### 7.1 Local Dev (Docker Compose)

```bash
docker compose up           # Everything
docker compose up sigwire   # Just Signal in the Wire
```

### 7.2 Render (First-Class — Free Tier)

```yaml
# render.yaml
services:
  - type: web
    name: openaxis-sigwire
    runtime: python
    buildCommand: cd packages/sigwire && pip install -e .
    startCommand: uvicorn openaxis.sigwire.app:app --host 0.0.0.0 --port $PORT
    disk:
      name: sigwire-data
      mountPath: /app/data
      sizeGB: 1
    envVars:
      - key: SIGWIRE_DATABASE_URL
        value: sqlite+aiosqlite:///app/data/sigwire.db
      - key: LLM_API_KEY
        sync: false

  - type: web
    name: openaxis-shell
    runtime: static
    buildCommand: cd packages/shell && npm ci && npm run build
    staticPublishPath: packages/shell/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### 7.3 Koyeb (First-Class — Free Tier)

```yaml
# koyeb.yaml
name: openaxis-sigwire
services:
  - name: sigwire
    type: web
    git:
      repository: github.com/youruser/openaxis
      branch: main
      build_command: cd packages/sigwire && pip install -e .
      run_command: uvicorn openaxis.sigwire.app:app --host 0.0.0.0 --port 8001
    instance_types:
      - type: nano
    ports:
      - port: 8001
        protocol: http
    env:
      - key: SIGWIRE_DATABASE_URL
        value: "sqlite+aiosqlite:///data/sigwire.db"
      - key: LLM_API_KEY
        value: "${LLM_API_KEY}"
```

### 7.4 Kubernetes (When there's demand)

Each Node is its own Deployment + Service. Helm chart provided when the platform matures.

### 7.5 Any Single Node, Anywhere

```bash
pip install openaxis-sigwire
SIGWIRE_DATABASE_URL=sqlite+aiosqlite:///sigwire.db LLM_API_KEY=sk-ant-... uvicorn openaxis.sigwire.app:app
```

---

## 8. Security Model

### 8.1 Auth (provided by openaxis-core)

- JWT-based with access + refresh tokens
- OAuth2 providers (Google, GitHub) via `authlib`
- API keys for programmatic access and external integrations
- RBAC: `admin`, `user`, `viewer`, `api_consumer`

### 8.2 Constitutional Gatekeeper

For financial actions, an AI safety layer checks proposals against user-defined rules:

```
AI proposes trade → Gatekeeper evaluates against rules → Pass/Fail → User approves → Execute
```

User rules are plain-English statements:
```json
[
  "Never allocate more than 5% of portfolio to a single position",
  "Require manual approval for any action over $500",
  "No crypto trades during weekends",
  "Block trades when article sentiment confidence is below 70%"
]
```

### 8.3 Cross-Node Permissions

Nodes declare what they `require` and `grant` in their manifest. The Permission Proxy in Core enforces this at the API level.

### 8.4 Audit Trail

Every cross-Node call, MCP tool invocation, and financial action is logged in Core's database. See Section 4.6.

### 8.5 Secrets Escalation Path

| Stage | Method | When |
|-------|--------|------|
| Local dev | `.env` file | Always |
| Render/Koyeb | Platform env vars / secrets manager | MVP |
| K8s production | HashiCorp Vault + mTLS | Scale |

---

## 9. Starter Nodes — Detailed Specs

### 9.1 Signal in the Wire / SigWire (Intelligence Node)

**Full name**: Signal in the Wire
**Short name**: SigWire
**Package**: `openaxis-sigwire`

**What it does**: Scrapes tech/dev/finance news sources, scores each article with an LLM, surfaces the best articles in a ranked feed. Users can also publish their own blog posts into the feed.

**Sources** (scraped or API):
- Hacker News (official API: `https://hacker-news.firebaseio.com/v0/`)
- RSS feeds: Simon Willison, TLDR AI, Latent Space, AlphaSignal, The Batch
- Substacks: OxyKodit and others via RSS
- Techmeme (Playwright scraper — add later, legally grey, technically fragile)

**Database tables** (in SigWire's own database):
```sql
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    scraper_type TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    last_scraped TIMESTAMPTZ
);

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    source_id INT REFERENCES sources(id),
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    summary TEXT,
    score_technical FLOAT,
    score_market FLOAT,
    score_novelty FLOAT,
    score_overall FLOAT,
    llm_rationale TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    is_internal BOOLEAN DEFAULT false
);

CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    external_url TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**LLM Ranking Prompt**:
```
You are a senior AI/software engineer and financial analyst.
Score each article 1-10 on three dimensions:

1. Technical Depth — does it contain implementation details, code, or architecture?
2. Market Impact — could this move a stock, sector, or funding round?
3. Novelty — is this genuinely new information vs. rehashed takes?

Weighting rules:
- 2x weight if the article mentions: latency optimization, RAG, agentic workflows,
  fine-tuning, token economics, regulatory changes, or open-source model releases
- 0.5x weight if the article is purely about AI company valuations or
  "AI will replace X" opinion pieces with no technical substance

Return ONLY valid JSON array:
[{"title": "...", "url": "...", "score_technical": N, "score_market": N,
  "score_novelty": N, "score_overall": N, "rationale": "..."}]
```

**Scraping interval**: Every 15 minutes (configurable). Cached for 4 hours to save LLM costs.

**Events emitted** (Phase 5+):
- `NEWS_FLASH` — when any article scores >= 8.0 overall
- `ARTICLE_RANKED` — when a new batch is scored

**Frontend**:
- Mobile-first, single-column card feed (max-width 640px centered on desktop)
- Each card: rank number, title (links to source), source badge, score, upvote/bookmark
- Internal blog posts: orange left border + "Original" badge
- External articles: standard styling, link opens source in new tab
- Admin page: split-pane editor on desktop, stacked on mobile
- Toggle between "Internal Blog" (markdown) and "Direct Link" (URL)

### 9.2 openaxis-trader (Action Node)

**What it does**: Subscribes to SigWire's articles (via REST polling initially, event bus later), extracts mentioned tickers, runs technical + fundamental analysis, generates an LLM trade thesis, and proposes trades for user approval.

**Data flow**:
```
Poll SigWire API for high-scoring articles (or NEWS_FLASH event in Phase 5+)
→ Extract ticker symbols from article title + summary
→ Fetch technicals via Yahoo Finance (yfinance): RSI, MACD, Bollinger, Volume
→ Fetch fundamentals: P/E, revenue growth, sector data
→ (If Open Data Node active) Pull macro data via REST
→ LLM synthesizes a trade thesis with confidence score
→ Constitutional Gatekeeper checks against user rules
→ If passes: notify user
→ User approves in UI → execute (paper trading for v0.1)
```

**Database tables** (in the Trader's own database):
```sql
CREATE TABLE signals (
    id SERIAL PRIMARY KEY,
    article_id INT,
    ticker TEXT NOT NULL,
    direction TEXT NOT NULL,
    confidence FLOAT,
    thesis TEXT,
    technicals JSONB,
    fundamentals JSONB,
    gatekeeper_result JSONB,
    status TEXT DEFAULT 'proposed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    ticker TEXT NOT NULL,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    signal_id INT REFERENCES signals(id),
    ticker TEXT NOT NULL,
    entry_price FLOAT,
    quantity FLOAT,
    status TEXT DEFAULT 'open',
    pnl FLOAT,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);
```

**v0.1 = Paper Trading Only.** No real money.

### 9.3 openaxis-opendata (Utility Node)

**What it does**: Indexes and queries public datasets. Makes them available to other Nodes via REST + MCP.

**Initial connectors**: FRED, SEC EDGAR, data.gov, user-uploaded CSV/JSON.

**Key features**: Dataset registry with schema metadata, natural language search, auto-detect CSV/JSON column types, MCP resource: `openaxis://opendata/datasets/{id}`.

### 9.4 openaxis-viz (Utility Node)

**What it does**: A modern BI / analytics tool. Works like a traditional BI tool first — connect data sources, build charts, explore data. No AI required to use it. GenBI capabilities layer on top for natural-language queries and auto-suggested visualizations.

**No database needed.** Viz works with external data sources — it doesn't store data, it renders it. Connects to other Nodes (SigWire, Open Data, MeanSky) or any REST/CSV/JSON endpoint.

**Key features**: Traditional BI (connect data sources, drag-and-drop chart builder, filters, grouping), GenBI layer (natural language queries, auto chart type selection), interactive charts via Recharts or Chart.js, export PNG/SVG, embeddable standalone URLs, will use Open Data Explorer as a primary data source in future, MCP tool: `generate_chart(source_url, chart_type)`.

---

## 10. Frontend Shell (openaxis-shell)

### 10.1 Node Registry

```typescript
export interface NodeEntry {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "Intelligence" | "Action" | "Utility" | "Capital";
  apiUrl: string;
  component: () => Promise<{ default: React.ComponentType }>;
}

export const NODE_REGISTRY: NodeEntry[] = [
  {
    id: "sigwire",
    name: "Signal in the Wire",
    description: "AI-ranked news feed",
    icon: "Newspaper",
    category: "Intelligence",
    apiUrl: import.meta.env.VITE_SIGWIRE_URL || "http://localhost:8001",
    component: () => import("./modules/sigwire/FeedView"),
  },
  {
    id: "trader",
    name: "Signal Trader",
    description: "Context-aware algo trading",
    icon: "TrendingUp",
    category: "Action",
    apiUrl: import.meta.env.VITE_TRADER_URL || "http://localhost:8002",
    component: () => import("./modules/trader/DashboardView"),
  },
  {
    id: "opendata",
    name: "Open Data",
    description: "Public dataset explorer",
    icon: "Database",
    category: "Utility",
    apiUrl: import.meta.env.VITE_OPENDATA_URL || "http://localhost:8003",
    component: () => import("./modules/opendata/ExplorerView"),
  },
  {
    id: "viz",
    name: "GenBI Viz",
    description: "BI / analytics tool",
    icon: "BarChart3",
    category: "Utility",
    apiUrl: import.meta.env.VITE_VIZ_URL || "http://localhost:8004",
    component: () => import("./modules/viz/VizView"),
  },
];
```

### 10.2 Shared State

```typescript
import { create } from "zustand";

interface AxisState {
  currentFocus: string | null;
  activeEvents: BusEvent[];
  user: User | null;
  setFocus: (f: string | null) => void;
  pushEvent: (e: BusEvent) => void;
  setUser: (u: User | null) => void;
}
```

When the user clicks an article mentioning Nvidia in SigWire, `currentFocus` is set to `"NVDA"`. The Signal Trader reads this and auto-pulls the NVDA chart. Zero coupling — just shared state.

### 10.3 Design System

- **Background**: `gray-950` / **Surface**: `gray-900` / **Borders**: `gray-800`
- **Text**: `gray-100` primary, `gray-400` secondary, `gray-500` muted
- **Accent**: `orange-500` (internal), `blue-500` (external), `green-500` (safe), `red-500` (danger)
- **Font**: System stack. **Layout**: Mobile-first. **Cards**: `rounded-lg`, `border border-gray-800`

---

## 11. AI Coding Rules

These go in `.cursorrules` and `CLAUDE.md`. Same content in both.

```markdown
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
```

---

## 12. Environment Variables

```bash
# .env.example

# Database — only for Nodes that need persistence
CORE_DATABASE_URL=sqlite+aiosqlite:///data/core.db
SIGWIRE_DATABASE_URL=sqlite+aiosqlite:///data/sigwire.db
TRADER_DATABASE_URL=sqlite+aiosqlite:///data/trader.db
OPENDATA_DATABASE_URL=sqlite+aiosqlite:///data/opendata.db
# Note: Viz and MeanSky don't need a DB

# Phase 2+: PostgreSQL (swap when you need concurrency)
# CORE_DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/core

# Redis (Phase 5+ — event bus, not needed for launch)
# REDIS_URL=redis://localhost:6379

# LLM
LLM_API_KEY=sk-ant-...
LLM_MODEL=claude-sonnet-4-20250514

# Auth
JWT_SECRET=change-me-in-production
JWT_EXPIRY_MINUTES=60

# Scraping
SCRAPE_INTERVAL_MINUTES=15
HN_ENABLED=true

# Node URLs (how Nodes find each other)
CORE_URL=http://localhost:8000
SIGWIRE_URL=http://localhost:8001
TRADER_URL=http://localhost:8002
OPENDATA_URL=http://localhost:8003
VIZ_URL=http://localhost:8004

# Environment
ENVIRONMENT=development
```

---

## 13. Build Phases (The "No Plan" Roadmap)

**The golden rule: SigWire ships before anything else gets started.**

### Phase 1: OpenAxis Studio + SigWire (The Week)
**Goal**: A working dashboard you use to build and monitor everything else. SigWire is the first real node built inside it.

**Day 1 (Mon) — Studio skeleton + SigWire API:**
- [ ] `openaxis-studio`: React app — your dev dashboard. Shows registered nodes, health status, links to API docs. Starts ugly, gets better.
- [ ] `openaxis-sigwire`: FastAPI app with its own SQLite DB
- [ ] HN scraper + RSS scraper (Simon Willison, TLDR AI, Latent Space)
- [ ] LLM ranker: score articles, return the best ones
- [ ] Studio shows SigWire as a registered node with health check

**Day 2 (Tue) — Feed UI + deploy:**
- [ ] Studio gets a feed view for SigWire (Reddit-style cards, mobile-first)
- [ ] Blog admin page: add internal posts, toggle Internal Blog / Direct Link
- [ ] Deploy Studio + SigWire to Render
- [ ] **Send the link to 5 people. Do they come back?**

**Day 3 (Wed) — MCP:**
- [ ] `openaxis-core`: MCP decorator library (`@mcp_tool`, `@mcp_resource`)
- [ ] SigWire exposed as MCP resources + tools
- [ ] Studio MCP server: `list_nodes()`, `get_node_schema()`, `scaffold_node()`
- [ ] Test with Claude Desktop / Cursor: "what are today's top AI stories?"
- [ ] **Record a 60-second demo**

**Day 4 (Thu) — Node Zero + MeanSky retrofit:**
- [ ] Studio pitch page: what OpenAxis is, what's built, roadmap
- [ ] Embed API docs (FastAPI gives this for free)
- [ ] Retrofit MeanSky as an OpenAxis node (add manifest, health endpoint, register in Studio)
- [ ] Studio now shows 2 live nodes

**Day 5 (Fri) — Open Data Explorer:**
- [ ] `openaxis-opendata`: FRED API connector
- [ ] Natural language search for datasets
- [ ] Expose as MCP resource
- [ ] Studio shows 3 nodes, all queryable

**Day 6 (Sat) — GenBI Viz:**
- [ ] `openaxis-viz`: connect to Open Data, basic charting (Recharts)
- [ ] Traditional BI controls: pick a dataset, pick chart type, render
- [ ] Embeddable chart URLs
- [ ] Studio shows 4 nodes, cross-app demo working

**Day 7 (Sun) — Polish + ship:**
- [ ] Studio polish: clean the dashboard, make the pitch page compelling
- [ ] API key onboarding: guided setup for Anthropic, Render, Koyeb keys
- [ ] README, demo video (2 min), CHANGELOG
- [ ] Push to GitHub
- [ ] **Post "Show HN" Monday morning**

### — CHECKPOINT: Does anyone care? —

**Evaluate.** If people are using it and the MCP demo gets traction, proceed. If not, iterate until it's useful. Do NOT move forward just because you're bored.

### Phase 2: Core Library Extraction (When needed)
Only when you're building the Trader or onboarding Westy.

- [ ] `openaxis-core`: auth library + its own SQLite DB
- [ ] `openaxis-core`: DB factory helper
- [ ] `openaxis-core`: permissions + audit logging
- [ ] Retrofit SigWire to use Core auth
- [ ] Publish `openaxis-core` to PyPI

### Phase 3: Signal Trader — Paper Trading Demo
Only if the MCP demo generated interest.

- [ ] `openaxis-trader`: own FastAPI app, own DB
- [ ] Poll SigWire API for high-scoring articles
- [ ] Technical analysis via yfinance
- [ ] LLM trade thesis generation
- [ ] Constitutional Gatekeeper
- [ ] **Record the full "Intelligence-to-Action" demo video**

### Phase 4: Studio Evolution
Grow the Studio from dev dashboard into the Lovable/Replit competitor. Leverage open-source tools — don't build an IDE from scratch.

- [ ] Embed **Sandpack** (CodeSandbox's open-source editor component, MIT license) for in-browser code editing with live preview
- [ ] Plain-English app scaffolding via Claude API — describe an app, see the generated code in Sandpack, edit, deploy
- [ ] One-click deploy to Render or Koyeb from the UI
- [ ] Onboarding wizard: Anthropic, OpenAI, Render, Koyeb, Auth0, Stripe keys
- [ ] Import: paste a GitHub URL, or import from Lovable/Replit/Bolt
- [ ] Template gallery: "Start from SigWire", "Start from MeanSky", "Blank node"
- [ ] Eject button: clone to GitHub, open in Cursor, never come back

### Phase 5: Community & Ecosystem (When ready)
Only when someone else is actively trying to build a Node.

- [ ] Publish all packages to PyPI / npm
- [ ] Node manifest schema finalized
- [ ] Contributor docs
- [ ] Onboard Westy's Stock Correlations as first external Node
- [ ] **GitHub launch + Hacker News "Show HN" post**

### Phase 6: Capital Layer (When there's real demand)
Only with legal review and a team.

- [ ] Open Banking integration (Plaid/TrueLayer) as new Node
- [ ] DeFi integration (Wagmi/Viem) as new Node
- [ ] Subscription/payments (Stripe)
- [ ] Helm chart for K8s deployment

---

## 14. OpenAxis as Node Zero

OpenAxis is its own first user. The project site (`openaxis.dev` or similar) is a deployed OpenAxis node — built with the same libraries, hosted on Render, queryable via MCP.

### 14.1 The Website Node

A simple web app that serves as the public face of the project:

- **Pitch page** — what OpenAxis is, what's built, what's coming (the pitch from this spec, rendered as a clean landing page)
- **Built with OpenAxis** — showcase of live nodes (SigWire, MeanSky, Open Data, Viz) with links and status
- **Roadmap** — high-level phases, what's shipped, what's next (auto-generated from CHANGELOG)
- **API docs** — auto-generated OpenAPI docs for the core library (FastAPI gives this for free at `/docs`)
- **MCP endpoint** — the OpenAxis MCP server, live and queryable

### 14.2 The OpenAxis MCP Server

Developers connect to the OpenAxis MCP from their coding tool (Cursor, Claude Code) and get:

**Scaffold tools:**
```
@mcp_tool() scaffold_node(name, category, description)
  → Generates a complete node package (app.py, router.py, manifest.json, pyproject.toml)

@mcp_tool() scaffold_plugin(type, name)
  → Generates a plugin skeleton (auth provider, payment integration, data connector)
```

**Discovery tools:**
```
@mcp_tool() list_nodes()
  → Returns all known OpenAxis nodes with status, descriptions, API URLs

@mcp_tool() get_node_schema(node_id)
  → Returns a node's manifest, API endpoints, and MCP tools

@mcp_tool() search_plugins(query)
  → Searches community-contributed plugins
```

**Contribution tools:**
```
@mcp_tool() submit_plugin(repo_url, description)
  → Registers a new plugin/feature for review

@mcp_tool() create_pull_request(target_package, branch, description)
  → Helps format and submit a PR back to the OpenAxis core repo
```

**What this means in practice:**

A developer opens Claude Code and says:
1. "Connect to the OpenAxis MCP" → Claude connects to `mcp://openaxis.dev`
2. "Scaffold me a new weather app node" → Claude calls `scaffold_node` and generates the full package
3. "Add Stripe payment support" → Claude calls `scaffold_plugin(type="payment", name="stripe")` and generates the integration skeleton
4. "Submit this back to OpenAxis" → Claude calls `create_pull_request` and pushes the contribution

Every user of OpenAxis can extend it from within their own app and push features back. The platform grows from the contributions of everyone building on it.

### 14.3 The Plugin System

Users can add features to OpenAxis from within their apps:

| Plugin Type | Example | How It Works |
|------------|---------|-------------|
| **Auth provider** | Add Auth0, Clerk, Supabase Auth | Implements the `openaxis.core.auth` interface |
| **Payment** | Stripe, LemonSqueezy, Paddle | Adds subscription/payment endpoints any Node can use |
| **Data connector** | New weather API, stock API, CMS | Implements the connector interface for Open Data |
| **Scraper** | New news source for SigWire | Implements the scraper interface |
| **Chart type** | New visualization for GenBI Viz | Adds a renderer to the chart engine |
| **Deploy target** | Fly.io, Railway config generators | Adds deploy configs for new platforms |

Plugins are just Python packages that follow a simple interface. They can be published to PyPI independently or submitted as PRs to the core repo.

---

## 15. Launch & Visibility

### The HN Play

Lead with the app, not the platform:

> **"Show HN: SigWire — an AI-ranked news feed you can query from Claude via MCP"**

People click on tools they can use today. The platform story comes out in the comments: "How does the MCP bit work?" → "It's built on OpenAxis — here's how you'd build your own app on it in an afternoon."

HN loves: open source replacing locked-in SaaS, solo dev "I built this" narratives, working demos, MCP (hot protocol right now), anti-vendor-lock-in. OpenAxis hits all of these — but only if SigWire is live and useful.

### The Demo Video
1. Ask Claude via MCP: "What are today's top AI stories on SigWire?"
2. Claude reads the feed via `openaxis://sigwire/trending`
3. Claude identifies a high-impact story
4. Claude calls `propose_trade` MCP tool
5. Gatekeeper checks against user rules
6. User approves in the Shell UI

Record as a 2-minute screen recording.

---

## 16. Naming Decision

### Platform Name (Working — TBD)

| Candidate | Verdict | Reason |
|-----------|---------|--------|
| AETHEREUM | Rejected | Too close to Ethereum |
| AXON | Rejected | Conflicts with Axon Enterprise + Axon Framework |
| OpenFlow | Rejected | Conflicts with Snowflake Openflow |
| OpenNexus | Rejected | "Nexus" is overused |
| OpenAxis | Working name | Clean, communicates centrality. Final decision pending. |

### First App Name (Decided)

| Full Name | Short Name | Package |
|-----------|-----------|---------|
| **Signal in the Wire** | **SigWire** | `openaxis-sigwire` |

---

## 17. Plain-English Summaries

### For Developers (2 paragraphs)
OpenAxis is a set of composable libraries that turn the internet into secure, interchangeable building blocks for AI. Using MCP, it lets AI agents safely move between reading news, analyzing data, and executing financial actions — without being trapped in any single company's ecosystem. Default stack is Python/FastAPI + React/Vite, but any Node can be any language.

The first app is **Signal in the Wire** (SigWire) — an AI-ranked news aggregator that scores articles on technical depth, market impact, and novelty. The longer-term vision includes a trading signal engine, open data explorer, and BI/viz dashboards — each its own independently deployable package. Every package works standalone or composes with others. Deploy anywhere.

### For Friends & Family (1 paragraph)
Instead of building another app that keeps your data trapped, I'm building an open system that acts like a universal adapter. It lets AI safely connect your money, your news, and your tools together, no matter what apps or websites you use. The first thing I'm shipping is called Signal in the Wire — an AI-powered news feed that cuts through the noise to surface what actually matters.

### For Westy (1 paragraph)
Imagine building a Lego castle but having to manufacture every single brick yourself — that's what building user logins, payment systems, and data storage feels like. OpenAxis gives you ready-made bricks. Just `pip install openaxis-core` and you get auth and MCP for free. Build your Stock Correlation logic as a normal Python app, import the bits you need, and you've got a full product without being locked into expensive platforms.

---

## Appendix A: Aspirational Ideas (Parked)

These are real ideas but premature. None survive contact with "one dev, week one."

### Infrastructure & Security
- **WebAssembly (Wasm) sandboxing** for untrusted third-party Nodes
- **Istio / service mesh** with mTLS between all Nodes in K8s
- **HashiCorp Vault** as the default secrets manager
- **Dual-key signing for financial actions** — AI proposes, hardware wallet finalizes
- **Tamper-proof audit ledger** — signed, append-only log entries
- **K3s optimized deployment** for $10/month VPS sovereign hosting

### Capital Layer (Open Banking & DeFi)
- **Open Banking integration** via Plaid / TrueLayer / Salt Edge
- **DeFi execution** via Wagmi / Viem / Ethers.js
- **Unified Balance abstraction** — fiat + crypto in one number
- **Banking Proxy module** — secure modal for bank OAuth flows
- **"Deobank" module** — auto-moves money between TradFi and DeFi based on news sentiment
- **Non-custodial by default** — platform never holds keys

### Platform & Ecosystem
- **Module Marketplace** — browsable, installable community Nodes
- **`openaxis-cli` as a full SDK** — `openaxis init`, `openaxis node create`
- **Foreign module discovery** — scan a URL, find a remote Node's manifest
- **Subscription & payment system** (Stripe) built into Core
- **"Module Jam" events** — community hackathons
- **Headless mode** — API/MCP backend only, no Shell

### AI & Intelligence
- **"Uncertainty Scores"** on all LLM outputs
- **Multi-LLM fallback** — Gemini Flash / GPT-4o-mini when Claude is unavailable
- **Orchestrator background worker** (Celery / Dramatiq) for automated multi-Node workflows
- **"The Oracle"** — a meta-agent orchestrating multi-step agentic workflows

### Connectivity
- **GraphQL gateway** for complex cross-Node queries
- **gRPC** for high-performance inter-service communication
- **WebSocket streaming** for real-time dashboards

### The "Bitcoin Whitepaper" Framing
- Position OpenAxis as a **protocol** for how Intelligence, Capital, and Utility interact
- Publish a formal **"OpenAxis Protocol" specification**
- The tagline: *"Money is just another form of data. If an AI can read news, it should be able to move value as easily as it moves text."*

---

*OpenAxis v0.1.0-genesis*
*Signal in the Wire — finding the signal in the noise.*
