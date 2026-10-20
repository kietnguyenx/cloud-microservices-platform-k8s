from fastapi.testclient import TestClient

try:
    from backend.main import app
except ImportError:
    from main import app

client = TestClient(app)

def test_docs_status():
    """Kiểm tra Swagger UI docs hoạt động"""
    response = client.get("/docs")
    assert response.status_code == 200

def test_metrics_status():
    """Kiểm tra Prometheus metrics endpoint hoạt động"""
    response = client.get("/metrics")
    assert response.status_code == 200

def test_liveness_probe():
    """Kiểm tra Kubernetes Liveness Probe (/healthz)"""
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "alive"

def test_readiness_probe():
    """Kiểm tra Kubernetes Readiness Probe (/readyz)"""
    response = client.get("/readyz")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ready"

def test_categories_api():
    """Kiểm tra API lấy danh mục sản phẩm"""
    response = client.get("/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_products_api():
    """Kiểm tra API lấy danh sách sản phẩm"""
    response = client.get("/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)