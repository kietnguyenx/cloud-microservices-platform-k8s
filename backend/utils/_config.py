import json
import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Cloud Microservices Platform"
    debug: bool = True

    # Database: nạp từ POSTGRES_URL hoặc fallback SQLite
    postgres_url: str = os.getenv("POSTGRES_URL", "sqlite:///./todo.db")
    database_url: str = ""

    # JWT Config
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key-for-todo-api-development-at-least-32-chars")
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 4320

    # Host & Port
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS Config
    cors_origins: Union[List[str], str] = ["*"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            if "," in v:
                return [origin.strip() for origin in v.split(",") if origin.strip()]
            return [v] if v else ["*"]
        elif isinstance(v, list):
            return v
        return ["*"]

    # Alias viết hoa tương thích ngược với _database.py
    @property
    def POSTGRES_URL(self) -> str:
        return self.database_url or self.postgres_url

    @property
    def DATABASE_URL(self) -> str:
        return self.POSTGRES_URL

    @property
    def JWT_SECRET_KEY(self) -> str:
        return self.jwt_secret or self.jwt_secret_key

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()