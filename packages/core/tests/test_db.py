"""Tests for the DB factory."""

import pytest

from openaxis.core.db import create_db


@pytest.mark.asyncio
async def test_create_db_returns_engine_and_session_factory():
    engine, SessionLocal = create_db("CORE_DATABASE_URL", "sqlite+aiosqlite://")
    assert engine is not None
    assert SessionLocal is not None


@pytest.mark.asyncio
async def test_create_db_with_default_url():
    import os

    os.environ["_TEST_DB_URL"] = "sqlite+aiosqlite://"
    engine, session_factory = create_db("_TEST_DB_URL", "sqlite+aiosqlite://")
    assert engine is not None


@pytest.mark.asyncio
async def test_session_factory_yields_session():
    from sqlalchemy.ext.asyncio import AsyncSession

    engine, SessionLocal = create_db("CORE_DATABASE_URL", "sqlite+aiosqlite://")
    async with SessionLocal() as session:
        assert isinstance(session, AsyncSession)
