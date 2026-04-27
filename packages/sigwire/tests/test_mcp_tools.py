"""Tests for SigWire MCP tools."""

import os

import pytest

os.environ.setdefault("SIGWIRE_DATABASE_URL", "sqlite+aiosqlite://")
os.environ.setdefault("SECRET_KEY", "test-secret")

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from openaxis.sigwire.app import app
from openaxis.sigwire.models import Base, Article, Source


@pytest.fixture
async def test_db():
    """Spin up an in-memory DB and patch SigWire to use it."""
    import openaxis.sigwire.db as db_module

    engine = create_async_engine("sqlite+aiosqlite://", echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    original_engine = db_module.engine
    original_session = db_module.async_session
    db_module.engine = engine
    db_module.async_session = session_factory

    yield session_factory

    db_module.engine = original_engine
    db_module.async_session = original_session
    await engine.dispose()


@pytest.fixture
async def seeded_db(test_db):
    """Seed with a source and two articles."""
    async with test_db() as session:
        source = Source(name="Test Source", url="https://test.com", scraper_type="rss")
        session.add(source)
        await session.flush()

        session.add(Article(
            source_id=source.id, title="RAG Pipeline Deep Dive", url="https://test.com/rag",
            summary="Everything about RAG", score_technical=9.0, score_market=7.0,
            score_novelty=8.0, score_overall=8.5, is_internal=False,
        ))
        session.add(Article(
            source_id=source.id, title="AI Valuations Hit Record", url="https://test.com/vals",
            summary="Big numbers in AI funding", score_technical=2.0, score_market=5.0,
            score_novelty=3.0, score_overall=3.0, is_internal=False,
        ))
        await session.commit()


@pytest.mark.asyncio
async def test_search_endpoint_returns_matches(seeded_db):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/articles/search?q=RAG")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert "RAG" in data[0]["title"]


@pytest.mark.asyncio
async def test_search_endpoint_no_results(seeded_db):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/articles/search?q=nonexistentxyz")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_search_endpoint_requires_q(seeded_db):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/articles/search")
    assert resp.status_code == 422
