import os
from typing import List
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings:
    # Database
    POSTGRES_URL: str = os.getenv(
        "POSTGRES_URL",
        "postgresql://postgres:postgres@localhost:5432/todo_db"
    )

    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "super-secret-jwt-key-for-todo-api-development-at-least-32-chars"
    )
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "4320"))

    # Server & CORS
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    @property
    def cors_origins(self) -> List[str]:
        raw_origins = os.getenv("CORS_ORIGINS", "")
        if not raw_origins:
            return ["*"]
        # Split by comma and strip whitespaces
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

settings = Settings()
