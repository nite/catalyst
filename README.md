# OpenAxis

**Composable libraries for building intelligent web apps.** Import what you need. Run each piece standalone. No framework lock-in.

Every app built with OpenAxis is automatically queryable by AI agents via MCP. Apps compose over REST — build a news feed, a BI tool, a trading engine, and they talk to each other.

---

## What's Built

| Package | What It Does | Port |
|---------|-------------|------|
| `packages/core` | Auth, MCP helpers, DB factory, permissions, audit log | library |
| `packages/sigwire` | Signal in the Wire — AI-ranked news aggregator | API :8001, Web :3000 |

---

## Quick Start

```bash
cp .env.example .env        # add LLM_API_KEY at minimum
make install                # uv sync + npm install
make dev                    # API on :8001, web on :3000
```

Or run SigWire directly:

```bash
cd packages/sigwire
make install
make dev
```

---

## How It Works

### Core Library

`openaxis-core` is a library, not a service. Install it in an app to get:

```python
from openaxis.core.mcp import mcp_tool, mcp_resource
from openaxis.core.auth import get_current_user
from openaxis.core.db import create_db
from openaxis.core.permissions import log_action, require_permission
```

It's optional — SigWire works without it. Install `openaxis-sigwire[mcp]` to enable MCP tools.

### SigWire

Signal in the Wire — an AI-ranked news aggregator. Scrapes HN + RSS feeds, scores articles with Claude, surfaces the best content.

```
packages/sigwire/
├── openaxis/sigwire/
│   ├── app.py          # FastAPI entry point
│   ├── router.py       # REST endpoints
│   ├── models.py       # SQLAlchemy models
│   ├── scraper.py      # HN + RSS scrapers
│   ├── ranker.py       # Claude scoring (configurable prompt)
│   └── mcp_tools.py    # MCP tools (when core is installed)
├── prompts/
│   └── ranking.md      # Default ranking prompt (customisable)
├── web/                # React 19 + Vite + Tailwind frontend
├── Dockerfile          # API container
├── Makefile            # dev, test, build commands
└── pyproject.toml
```

The ranking prompt is fully customisable — edit `prompts/ranking.md` or set `RANKING_PROMPT_FILE` to point to your own prompt.

### MCP

Every data-fetching function decorated with `@mcp_tool` or `@mcp_resource` is automatically exposed at `/mcp/tools` and `/mcp/resources`. Claude or any MCP-capable agent can query any app directly.

```bash
curl http://localhost:8001/mcp/tools
curl -X POST http://localhost:8001/mcp/tools/call \
  -H 'Content-Type: application/json' \
  -d '{"name": "get_top_articles", "arguments": {"limit": 5}}'
```

---

## Development

Local dev runs natively (no Docker):

```bash
make dev      # API :8001 + Vite :3000
make test     # all tests
make lint     # ruff check
```

Docker is for deployment only:

```bash
cd packages/sigwire && docker compose up
```

Each package has its own Makefile — `cd packages/sigwire && make help` for options.

---

## SigWire API

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /articles` | Ranked articles (highest score first) |
| `GET /articles?min_score=7` | Filter by minimum score |
| `GET /articles/search?q=RAG` | Keyword search across title + summary |
| `GET /articles/{id}` | Single article |
| `POST /scrape` | Trigger scrape + rank cycle |
| `GET /blog` | Published blog posts |
| `POST /blog` | Create a blog post |
| `GET /mcp/tools` | List registered MCP tools |
| `POST /mcp/tools/call` | Call an MCP tool |

---

## Environment Variables

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_API_KEY` | Yes | Anthropic API key |
| `LLM_MODEL` | No | Default: `claude-sonnet-4-20250514` |
| `SIGWIRE_DATABASE_URL` | No | Default: `sqlite+aiosqlite:///sigwire.db` |
| `RANKING_PROMPT_FILE` | No | Custom ranking prompt file path |
| `SECRET_KEY` | Yes (auth) | JWT signing key — `openssl rand -hex 32` |
| `CORE_DATABASE_URL` | No | Default: `sqlite+aiosqlite:///core.db` |
| `VITE_API_URL` | No | SigWire web → API URL, default `http://localhost:8001` |

---

## Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy (async), aiosqlite / PostgreSQL
- **LLM**: Anthropic Claude API
- **Frontend**: React 19, Vite 5, TypeScript 5, Tailwind CSS 3
- **State**: TanStack Query
- **Auth**: JWT (HS256), RBAC roles: `admin / user / viewer / api_consumer`
