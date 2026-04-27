"""Smoke tests for SigWire."""

import os
import pytest
from httpx import ASGITransport, AsyncClient

# Use in-memory SQLite for tests
os.environ["SIGWIRE_DATABASE_URL"] = "sqlite+aiosqlite://"

from openaxis.sigwire.app import app
from openaxis.sigwire.db import init_db


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["node"] == "sigwire"


async def test_list_articles_empty(client):
    resp = await client.get("/articles")
    assert resp.status_code == 200
    assert resp.json() == []


async def test_create_blog_post(client):
    resp = await client.post("/blog", json={
        "title": "Test Post",
        "content": "Hello world",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Test Post"
    assert data["is_published"] is True


async def test_list_blog_posts(client):
    await client.post("/blog", json={"title": "Blog Entry"})
    resp = await client.get("/blog")
    assert resp.status_code == 200
    assert len(resp.json()) >= 1
