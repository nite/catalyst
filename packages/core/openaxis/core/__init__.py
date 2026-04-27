"""OpenAxis Core Library.

Provides shared auth, MCP helpers, DB factory, and permissions for all OpenAxis nodes.

Usage::

    from openaxis.core.auth import router as auth_router, get_current_user
    from openaxis.core.mcp import mcp_tool, mcp_resource, create_mcp_router
    from openaxis.core.db import create_db
    from openaxis.core.config import get_setting
    from openaxis.core.permissions import require_permission, log_action
"""

from openaxis.core.config import get_setting
from openaxis.core.db import create_db
from openaxis.core.mcp.decorators import mcp_resource, mcp_tool
from openaxis.core.mcp.router import create_mcp_router
from openaxis.core.permissions.audit import log_action
from openaxis.core.permissions.decorators import require_permission

__all__ = [
    "get_setting",
    "create_db",
    "mcp_tool",
    "mcp_resource",
    "create_mcp_router",
    "log_action",
    "require_permission",
]
