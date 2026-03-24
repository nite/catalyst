"""Database engine and session for SigWire (owns its own storage)."""

import os
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from openaxis.sigwire.models import Base


def _get_db_url() -> str:
    return os.environ.get("SIGWIRE_DATABASE_URL", "sqlite+aiosqlite:///data/sigwire.db")


def _create_engine():
    db_url = _get_db_url()
    if "sqlite" in db_url and ":///" in db_url and db_url != "sqlite+aiosqlite://":
        db_path = db_url.split("///")[-1]
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    return create_async_engine(db_url, echo=False)


engine = _create_engine()
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Create all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session():
    """FastAPI dependency for DB sessions."""
    async with async_session() as session:
        yield session
