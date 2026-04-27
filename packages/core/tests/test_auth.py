"""Tests for auth — register, login, JWT, and /auth/me."""

import os

import pytest

os.environ["SECRET_KEY"] = "test-secret-auth"

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from openaxis.core.auth.router import _make_router
from openaxis.core.db import CoreBase


@pytest.fixture
def app():
    engine = create_async_engine("sqlite+aiosqlite://", echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def _init_db():
        async with engine.begin() as conn:
            await conn.run_sync(CoreBase.metadata.create_all)

    async def get_session():
        async with session_factory() as s:
            yield s

    import asyncio

    asyncio.get_event_loop().run_until_complete(_init_db())

    app = FastAPI()
    app.include_router(_make_router(get_session))
    return app


@pytest.fixture
def client(app):
    with TestClient(app) as c:
        yield c


def test_register_creates_user(client):
    resp = client.post("/auth/register", json={"email": "user@test.com", "password": "pass123"})
    assert resp.status_code == 201
    assert "access_token" in resp.json()


def test_register_duplicate_email(client):
    client.post("/auth/register", json={"email": "dup@test.com", "password": "pass"})
    resp = client.post("/auth/register", json={"email": "dup@test.com", "password": "pass"})
    assert resp.status_code == 409


def test_login_returns_token(client):
    client.post("/auth/register", json={"email": "login@test.com", "password": "secret"})
    resp = client.post("/auth/login", json={"email": "login@test.com", "password": "secret"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post("/auth/register", json={"email": "bad@test.com", "password": "right"})
    resp = client.post("/auth/login", json={"email": "bad@test.com", "password": "wrong"})
    assert resp.status_code == 401


def test_me_requires_auth(client):
    resp = client.get("/auth/me")
    assert resp.status_code == 401


def test_me_returns_user(client):
    client.post("/auth/register", json={"email": "me@test.com", "password": "pw"})
    login = client.post("/auth/login", json={"email": "me@test.com", "password": "pw"})
    token = login.json()["access_token"]
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@test.com"
