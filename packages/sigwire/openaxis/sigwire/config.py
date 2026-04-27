"""Environment-based configuration for SigWire."""

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = Field(
        default="sqlite+aiosqlite:///data/sigwire.db",
        alias="SIGWIRE_DATABASE_URL",
    )
    llm_api_key: str = Field(default="", alias="LLM_API_KEY")
    llm_model: str = Field(default="claude-sonnet-4-20250514", alias="LLM_MODEL")
    ranking_prompt_file: str = Field(default="", alias="RANKING_PROMPT_FILE")
    scrape_interval_minutes: int = Field(default=15, alias="SCRAPE_INTERVAL_MINUTES")
    hn_enabled: bool = Field(default=True, alias="HN_ENABLED")
    environment: str = Field(default="development", alias="ENVIRONMENT")

    model_config = {"populate_by_name": True}


settings = Settings()
