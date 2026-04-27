"""Reusable async DB engine factory for OpenAxis nodes."""

import os
from pathlib import Path
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase


def create_db(
    env_var: str,
    default_url: str = "sqlite+aiosqlite:///data/openaxis.db",
) -> tuple[Any, async_sessionmaker]:
    """Create an async SQLAlchemy engine + session factory from an env var.

    Args:
        env_var: Name of the environment variable holding the DB URL.
        default_url: Fallback URL if the env var is not set.

    Returns:
        Tuple of (engine, async_sessionmaker).

    Example::

        engine, SessionLocal = create_db("SIGWIRE_DATABASE_URL")
    """
    db_url = os.environ.get(env_var, default_url)

    # Auto-create data/ directory for SQLite files
    if "sqlite" in db_url and ":///" in db_url and db_url != "sqlite+aiosqlite://":
        db_path = db_url.split("///")[-1]
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    engine = create_async_engine(db_url, echo=False)
    session_factory = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    return engine, session_factory


class CoreBase(DeclarativeBase):
    """Shared declarative base for core models."""

    pass
