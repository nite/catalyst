"""User model for openaxis-core auth."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from openaxis.core.db import CoreBase


class User(CoreBase):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")  # admin|user|viewer|api_consumer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
