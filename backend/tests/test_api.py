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

def test_create_order_endpoint():
    """Kiểm tra tạo đơn hàng mới và trả về mã đơn hàng"""
    payload = {
        "customer_name": "Khách Test",
        "customer_phone": "0912345678",
        "shipping_address": "123 Đường Test, Hà Nội",
        "notes": "Giao giờ hành chính",
        "payment_method": "cod",
        "items": [
            {
                "product_id": 1,
                "product_name": "Sofa Modular Blanc",
                "product_image": "",
                "price": 16800000.0,
                "quantity": 1,
                "subtotal": 16800000.0
            }
        ]
    }
    response = client.post("/orders", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["customer_name"] == "Khách Test"
    assert data["order_code"].startswith("BLC-")
    assert len(data["items"]) == 1