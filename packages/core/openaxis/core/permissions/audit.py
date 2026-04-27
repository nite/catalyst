"""Audit logging for cross-Node actions and MCP tool calls."""

import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


async def log_action(
    actor: str,
    action: str,
    target_node: str,
    payload: dict | None = None,
    result: str = "ok",
    session=None,
) -> None:
    """Log an action to the audit trail.

    Writes to the audit_log table if a session is provided, otherwise
    falls back to structured logging.

    Args:
        actor: Email or identifier of the user/agent performing the action.
        action: Short action name, e.g. "create_blog_post".
        target_node: The node being acted on, e.g. "sigwire".
        payload: Optional dict of input data (will be JSON-serialized).
        result: Outcome string — "ok", "error: ..." etc.
        session: Optional AsyncSession. If None, logs to stderr only.
    """
    payload_str = json.dumps(payload) if payload else None
    logger.info(
        "audit actor=%s action=%s node=%s result=%s payload=%s",
        actor,
        action,
        target_node,
        result,
        payload_str,
    )

    if session is not None:
        from openaxis.core.permissions.models import AuditLog

        entry = AuditLog(
            timestamp=datetime.utcnow(),
            actor=actor,
            action=action,
            target_node=target_node,
            payload=payload_str,
            result=result,
        )
        session.add(entry)
        await session.commit()
