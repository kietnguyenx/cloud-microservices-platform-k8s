from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Kết nối tới postgres service trên cụm Kubernetes hoặc Docker Compose
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres-service:5432/appdb"
    SECRET_KEY: str = "super-secret-key-change-in-production-123456"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"

def get_settings() -> Settings:
    return Settings()