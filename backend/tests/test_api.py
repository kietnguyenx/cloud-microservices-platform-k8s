import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    """Kiểm tra phản hồi trang chủ API (chuyển hướng sang /app hoặc 200)"""
    response = client.get("/")
    assert response.status_code in [200, 307, 404]

def test_docs_available():
    """Đảm bảo OpenAPI Swagger docs truy cập được"""
    response = client.get("/docs")
    assert response.status_code == 200

def test_metrics_endpoint():
    """Đảm bảo Prometheus metrics endpoint hoạt động"""
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "process_cpu_seconds_total" in response.text or "python_gc_objects_collected_total" in response.text

def test_login_unauthorized():
    """Kiểm tra xử lý thông tin đăng nhập sai"""
    response = client.post("/login", json={"email": "wrong_user@blanc.vn", "password": "wrong_password"})
    assert response.status_code in [400, 401]