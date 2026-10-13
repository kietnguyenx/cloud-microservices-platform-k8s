import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from routes import _auth, _todo
from services._database import engine, get_db, init_db
from utils._config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Khởi tạo database/tables nếu chưa tồn tại
    init_db()
    yield
    # Shutdown: Thu dọn sạch connection pool tránh rò rỉ kết nối
    engine.dispose()


app = FastAPI(
    title="Production Todo API",
    description="Todo API with PostgreSQL, SQLAlchemy, JWT Authentication, and Kubernetes Probes",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Cấu hình CORS Middleware động từ settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if "*" not in settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký Routers (hỗ trợ cả route gốc và prefix /api)
app.include_router(_auth.router)
app.include_router(_todo.router)
app.include_router(_auth.router, prefix="/api", include_in_schema=False)
app.include_router(_todo.router, prefix="/api", include_in_schema=False)

# Mount Frontend UI tại /app (nếu thư mục tồn tại)
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.isdir(frontend_dir):
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")


# --- Root & Kubernetes Probe Endpoints ---

@app.get("/", tags=["General"])
def root():
    return {
        "message": "Welcome to Todo API",
        "frontend": "/app",
        "docs": "/docs",
        "health": "/healthz",
        "readiness": "/readyz",
    }


@app.get("/healthz", tags=["Health Probes"], summary="Kubernetes Liveness Probe")
def liveness_probe():
    """Liveness probe: Kiểm tra tiến trình server đang phản hồi."""
    return {"status": "alive"}


@app.get("/readyz", tags=["Health Probes"], summary="Kubernetes Readiness Probe")
def readiness_probe(response: Response, db: Session = Depends(get_db)):
    """Readiness probe: Kiểm tra kết nối database trước khi tiếp nhận traffic."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected",
        }
    except Exception as e:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "database": f"disconnected: {str(e)}",
        }