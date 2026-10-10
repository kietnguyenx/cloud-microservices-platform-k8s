from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, status, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from utils._config import settings
from services._database import get_db, init_db, engine
from routes import _auth, _todo


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables if PostgreSQL is connected
    init_db()
    yield
    # Shutdown: Cleanly dispose of SQLAlchemy connection pool
    engine.dispose()


app = FastAPI(
    title="Production Todo API",
    description="Todo API with PostgreSQL, SQLAlchemy, JWT Authentication, and Kubernetes Probes",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS Middleware dynamically from environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if "*" not in settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers (Support both standard routes and /api prefix)
app.include_router(_auth.router)
app.include_router(_todo.router)
app.include_router(_auth.router, prefix="/api", include_in_schema=False)
app.include_router(_todo.router, prefix="/api", include_in_schema=False)


import os
from fastapi.staticfiles import StaticFiles

# Mount Frontend UI at /app
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
        "readiness": "/readyz"
    }


@app.get("/healthz", tags=["Health Probes"], summary="Kubernetes Liveness Probe")
def liveness_probe():
    """Liveness probe: Checks if the application server is responsive."""
    return {"status": "alive"}


@app.get("/readyz", tags=["Health Probes"], summary="Kubernetes Readiness Probe")
def readiness_probe(response: Response, db: Session = Depends(get_db)):
    """Readiness probe: Checks database connectivity before routing traffic."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected"
        }
    except Exception as e:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "database": f"disconnected: {str(e)}"
        }
