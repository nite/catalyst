# OpenAxis

**The Sovereign Agentic Platform** — composable libraries for building, connecting, and deploying intelligent web apps.

Import what you need. Run each piece standalone or together. No framework lock-in.

## What's Live

### Signal in the Wire (SigWire) — `packages/sigwire/`

AI-ranked news aggregator. Scrapes Hacker News and RSS feeds, scores articles with Claude, surfaces the best ones.

```bash
cd packages/sigwire
pip install -e .
uvicorn openaxis.sigwire.app:app --port 8001
```

Then:
- `GET /health` — health check
- `POST /scrape` — trigger scrape + rank cycle
- `GET /articles` — ranked articles (highest score first)
- `GET /articles?min_score=7` — filter by minimum score
- `POST /blog` — create a blog post
- `GET /blog` — list published blog posts

## Stack

- **Backend**: FastAPI (Python), async everywhere
- **DB**: SQLite (per-node, zero-config)
- **LLM**: Anthropic Claude API
- **Frontend**: React + Vite + Tailwind (Phase 2)

## Environment Variables

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

Key vars: `SIGWIRE_DATABASE_URL`, `LLM_API_KEY`, `LLM_MODEL`

## Architecture

Each package is a standalone app ("Node"). Nodes talk via REST. No shared storage. No direct imports between Nodes. See `CLAUDE.md` for full coding rules.
