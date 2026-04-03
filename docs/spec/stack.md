# OpenAxis — Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Backend** | FastAPI (Python) | Async-native, trivial MCP integration, auto-generated OpenAPI docs |
| **Frontend** | React 19 + Vite + Tailwind CSS | Fast builds, mobile-first, massive ecosystem |
| **Database** | SQLite / PostgreSQL / none | Per-Node choice. Some Nodes need persistence, some don't. |
| **DB Architecture** | Each Node owns its own storage (if any) | True isolation — delete a Node, nothing else notices |
| **Cache / Event Bus** | Redis (Phase 5+) | Pub/sub for inter-Node events — not needed for launch which uses REST |
| **Secrets** | Environment variables (MVP) → HashiCorp Vault (production) | Pragmatic security escalation |
| **LLM** | Anthropic Claude API (`claude-sonnet-4-20250514`) | Article ranking, trade thesis generation, chart suggestions |
| **State Management** | Zustand (frontend) | Lightweight shared state across Nodes |
| **Data Fetching** | TanStack Query (frontend) | Caching, background refetch, loading states |

## What We're NOT Using (Yet)

- **No PostgreSQL in Phase 1** — SQLite is zero-config where you need persistence; upgrade to Postgres when you need concurrent users; some Nodes won't need a DB at all
- **No GraphQL** — REST + MCP is enough for v0.1; GraphQL is a v0.3 consideration
- **No gRPC** — future consideration for high-frequency inter-service calls
- **No MongoDB** — SQLite/PostgreSQL handles everything; add document stores per-Node if needed later
- **No Kubernetes** — Render/Koyeb first; Helm charts come when there's demand

## Environment Variables

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
