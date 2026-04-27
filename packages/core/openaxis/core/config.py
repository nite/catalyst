"""Core settings and config helpers."""

import os

from pydantic_settings import BaseSettings


class CoreSettings(BaseSettings):
    secret_key: str = "dev-secret-change-in-production"
    core_database_url: str = "sqlite+aiosqlite:///data/core.db"
    environment: str = "development"
    debug: bool = False
    access_token_expire_minutes: int = 1440  # 24 hours

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = CoreSettings()


def get_setting(key: str, default: str = "") -> str:
    """Read a setting from environment variables with an optional default."""
    return os.environ.get(key, default)
