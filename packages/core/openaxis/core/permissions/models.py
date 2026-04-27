"""AuditLog SQLAlchemy model."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from openaxis.core.db import CoreBase


class AuditLog(CoreBase):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    actor = Column(String, nullable=False)    # email or "system"
    action = Column(String, nullable=False)   # e.g. "create_blog_post"
    target_node = Column(String, nullable=False)  # e.g. "sigwire"
    payload = Column(Text, nullable=True)     # JSON string of input data
    result = Column(Text, nullable=True)      # "ok" | "error: ..."
