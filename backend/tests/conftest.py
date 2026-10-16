import os
import sys
import pytest
from fastapi.testclient import TestClient

# Đảm bảo root và backend luôn có trong sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.main import app
from backend.database import init_db, SessionLocal, seed_initial_data

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Tự động khởi tạo database và nạp dữ liệu mẫu trước khi chạy test."""
    init_db()
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield

@pytest.fixture
def client():
    """Cung cấp TestClient kích hoạt lifespan context manager đầy đủ."""
    with TestClient(app) as c:
        yield c

