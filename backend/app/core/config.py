from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    app_name: str = "Catalyst Data Visualization API"
    version: str = "1.0.0"
    api_prefix: str = "/api/v1"
    
    # CORS settings
    cors_origins: list = ["*"]
    
    # Data size thresholds for aggregation strategy
    large_dataset_row_threshold: int = 100000
    large_dataset_size_threshold: int = 5 * 1024 * 1024  # 5MB
    
    # API keys for data providers (optional, some don't require keys)
    data_gov_api_token: str = ""
    world_bank_api_token: str = ""
    
    class Config:
        env_file = ".env"


settings = Settings()
