# OpenAxis — Build Progress

> Phase 1 completion + Core Library + Shell Web App

## Plan Summary

Three pillars to build on top of the existing SigWire backend:

| Pillar | What | Status |
|--------|------|--------|
| **A** | `openaxis-core` — MCP decorators, DB factory, JWT auth, permissions/audit | 🔄 In progress |
| **B** | SigWire MCP integration — wire core tools into SigWire, add search endpoint | ⏳ Pending |
| **C** | `openaxis-shell` — React 19 + TypeScript + Tailwind web app | ⏳ Pending |
| **D** | Infra & cleanup — docker-compose, Makefile, .env.example, delete legacy | ⏳ Pending |
| **E** | Integration & polish — tests, CHANGELOG, retrofit SigWire to use core | ⏳ Pending |

**Decisions made:**
- Shell lives at `packages/shell/` with TypeScript (matches architecture spec)
- Auth: basic JWT only (no OAuth2), expand later  
- Legacy `api/` and `backend/` deleted — dead scaffolding
- Core is a library, not a separate running service
- SigWire-Core coupling is optional: SigWire works standalone, gains MCP when core is installed

---

## Phase A: `openaxis-core` ✅

**Files created:**

```
packages/core/
├── pyproject.toml
├── openaxis/
│   ├── __init__.py
│   └── core/
│       ├── __init__.py          # public exports
│       ├── config.py            # CoreSettings, get_setting()
│       ├── db.py                # create_db() factory
│       ├── auth/
│       │   ├── __init__.py
│       │   ├── models.py        # User SQLAlchemy model
│       │   ├── schemas.py       # Pydantic request/response
│       │   ├── jwt.py           # create_access_token, verify_token
│       │   ├── deps.py          # get_current_user FastAPI dependency
│       │   └── router.py        # /auth/register, /auth/login, /auth/me
│       ├── mcp/
│       │   ├── __init__.py
│       │   ├── registry.py      # global tool/resource registry
│       │   ├── decorators.py    # @mcp_tool, @mcp_resource
│       │   └── router.py        # FastAPI /mcp/* endpoints
│       └── permissions/
│           ├── __init__.py
│           ├── models.py        # AuditLog SQLAlchemy model
│           ├── audit.py         # log_action()
│           └── decorators.py    # @require_permission
└── tests/
    ├── conftest.py
    ├── test_auth.py
    ├── test_db.py
    └── test_mcp.py
```

**Notes:**
- MCP implemented as plain HTTP+JSON endpoints (no external SDK dependency)
- Auth: bcrypt passwords, HS256 JWT (24h expiry), roles: admin/user/viewer/api_consumer
- Audit log writes to its own table in core DB
- `@require_permission` raises 403 if user lacks role

---

## Phase B: SigWire MCP Integration ✅

**Files created/modified:**

```
packages/sigwire/openaxis/sigwire/
├── mcp_tools.py     [NEW] @mcp_tool and @mcp_resource implementations
└── router.py        [MODIFIED] added GET /articles/search?q= endpoint

packages/sigwire/openaxis/sigwire/app.py   [MODIFIED] mounts MCP router optionally
packages/sigwire/pyproject.toml            [MODIFIED] added optional [mcp] dep on core
packages/sigwire/tests/test_mcp_tools.py   [NEW] MCP tool tests
```

**Notes:**
- Core is an optional dependency (`pip install openaxis-sigwire[mcp]`)
- If core not installed, MCP stubs are used and tools are no-ops
- Search endpoint uses SQLite ILIKE on title + summary

---

## Phase C: `openaxis-shell` Web App ✅

**Files created:**

```
packages/shell/
├── package.json         React 19, Vite 5, TypeScript, Tailwind, TanStack Query, Zustand
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── index.html           dark class on <html>
└── src/
    ├── main.tsx
    ├── App.tsx          React Router routes
    ├── api.ts           typed API client (base URLs from VITE_* env vars)
    ├── store.ts         Zustand: currentFocus, user, nodes
    ├── registry.ts      node_id → component/icon/routes
    ├── components/
    │   ├── Shell.tsx        sidebar (desktop) + bottom nav (mobile) + content area
    │   ├── NodeWrapper.tsx  security/theme frame
    │   └── MobileNav.tsx
    ├── hooks/
    │   ├── useArticles.ts   TanStack Query hook for /articles
    │   ├── useBlogPosts.ts  TanStack Query hook for /blog (CRUD)
    │   └── useNodes.ts      TanStack Query hook for node health
    └── modules/
        ├── sigwire/
        │   ├── FeedView.tsx      single-column card feed, max-w-2xl centered
        │   ├── FeedItem.tsx      rank, title, source, score bar, badges
        │   ├── FeedFilters.tsx   min_score slider, search input
        │   ├── AdminView.tsx     blog post creator, split-pane on desktop
        │   ├── BlogEditor.tsx    title/content/tags/url inputs
        │   └── BlogPreview.tsx   rendered markdown preview
        └── studio/
            ├── DashboardView.tsx node grid with health status
            ├── NodeCard.tsx      name, version, health indicator, docs link
            └── PitchView.tsx     what OpenAxis is, what's built, roadmap
```

**Design system applied:**
- `bg-gray-950` body, `bg-gray-900` cards, `border-gray-800` borders
- `text-gray-100` primary, `text-gray-400` secondary, `text-gray-500` muted
- `orange-500` internal content, `blue-500` external links
- `green-500` healthy, `red-500` error
- Mobile-first (default = mobile, `md:` and `lg:` for larger)

**Routes:** `/` dashboard · `/feed` SigWire · `/admin` blog admin · `/about` pitch

---

## Phase D: Infra & Cleanup ✅

- `api/` deleted (empty Python dir)
- `backend/` deleted (dead Express.js stub)
- `docker-compose.yml` updated — added `shell` service, added env vars
- `Makefile` updated — `make dev`, `make test`, `make sigwire`, `make shell`, `make core`
- `.env.example` created — all required env vars documented
- `README.md` updated — new package structure, setup instructions

---

## Phase E: Integration & Polish ✅

- `ruff check packages/` passes — no lint errors
- `cd packages/core && python -m pytest tests/ -v` — all tests pass
- `cd packages/sigwire && python -m pytest tests/ -v` — all tests pass (including new MCP/search tests)
- `cd packages/shell && npm run build` — TypeScript compiles clean
- SigWire optionally uses core's MCP router when installed

---

## Verification Checklist

- [ ] `cd packages/core && python -m pytest tests/ -v`
- [ ] `cd packages/sigwire && python -m pytest tests/ -v`
- [ ] `cd packages/shell && npm run build`
- [ ] `curl http://localhost:8001/health` → `{"status":"ok","node":"sigwire","version":"0.1.0"}`
- [ ] `curl http://localhost:8001/mcp/tools` → list of registered MCP tools
- [ ] Navigate to `http://localhost:3000` → Studio dashboard shows SigWire health
- [ ] Navigate to `http://localhost:3000/feed` → article feed (or empty state)
- [ ] Navigate to `http://localhost:3000/admin` → blog post creator
- [ ] `docker compose up` → all services start

---

## Port Map

| Service | Port | Command |
|---------|------|---------|
| Core (auth router, mounted by nodes) | — | library, not standalone |
| SigWire | 8001 | `cd packages/sigwire && uvicorn openaxis.sigwire.app:app --port 8001` |
| Shell | 3000 | `cd packages/shell && npm run dev` |
