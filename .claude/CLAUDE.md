# OpenAxis — Project Instructions

<!-- Full build spec: docs/openaxis-build-spec.md (read on demand, not imported) -->

## Quick Reference

- **Run SigWire dev**: `cd packages/sigwire && make dev` (API :8001 + web :3000)
- **Run SigWire API only**: `cd packages/sigwire && make api`
- **Health check**: `curl http://localhost:8001/health`
- **Run all tests**: `make test`
- **Run SigWire tests**: `cd packages/sigwire && make test`
- **Lint**: `uv run ruff check packages/`
- **Format**: `uv run ruff format packages/`

## Architecture

- **OpenAxis is a library, not a platform** — no central shell, no node registry
- Monorepo: `packages/core/` (library) + `packages/sigwire/` (standalone app)
- Each app has its own API, frontend, database, Makefile, Dockerfile
- Cross-app communication via REST only — no shared imports, no shared DB
- Directory structure supports splitting into separate repos later
- Local dev is native (no Docker) — Docker is for deployment only

## Current State

- **Core** (`packages/core/`): Auth, MCP helpers, DB factory, permissions (15 tests)
- **SigWire** (`packages/sigwire/`): AI-ranked news aggregator (10 tests)
  - API: FastAPI backend with HN scraper, Claude ranker, blog posts
  - Web: React 19 + Vite + Tailwind frontend at `packages/sigwire/web/`
  - Ranking prompt: Customisable via `prompts/ranking.md` or `RANKING_PROMPT_FILE` env var

## Commit Convention

Format: `{package}: {what changed}`
Example: `sigwire: add Hacker News scraper`
