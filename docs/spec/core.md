# OpenAxis — Core Library (openaxis-core)

## What It Exports

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

## Auth

- JWT-based with access + refresh tokens
- OAuth2 providers (Google, GitHub) via `authlib`
- API keys for programmatic access
- RBAC: `admin`, `user`, `viewer`, `api_consumer`
- Core has its own database for users + sessions

## MCP Helpers

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

## Database Factory

```python
from openaxis.core.db import create_db
engine, SessionLocal = create_db("SIGWIRE_DATABASE_URL")
```

Works with SQLite or PostgreSQL. The Node doesn't care which.

## Permissions & Audit Trail

Nodes declare `requires` and `grants` in their manifest. The Permission Proxy enforces this at the API level.

Every cross-Node call, MCP tool invocation, and financial action is logged:

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

## Event Bus (Phase 5+)

Redis pub/sub for real-time inter-Node communication. **Not needed for launch** — use REST polling instead.

```python
CHANNELS = {
    "NEWS_FLASH": "openaxis:news_flash",        # article score >= 8.0
    "ARTICLE_RANKED": "openaxis:article_ranked",
    "TRADE_SIGNAL": "openaxis:trade_signal",
    "TRADE_PROPOSAL": "openaxis:trade_proposal",
    "DATA_UPDATE": "openaxis:data_update",
    "ALERT": "openaxis:alert",
}
```
