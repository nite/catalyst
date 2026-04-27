"""Shared test fixtures for openaxis-core."""

import os

import pytest

os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("CORE_DATABASE_URL", "sqlite+aiosqlite://")


@pytest.fixture
def anyio_backend():
    return "asyncio"
