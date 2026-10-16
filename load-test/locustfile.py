import random
from locust import HttpUser, task, between


class MicroservicesLoadTestUser(HttpUser):
    """
    Kịch bản kiểm thử tải (Load Testing) cho nền tảng Microservices.
    Mục đích:
    1. Tạo tải thực tế lên hệ thống để kích hoạt Horizontal Pod Autoscaler (HPA co giãn từ 2 -> 10 Pods).
    2. Cung cấp lưu lượng request thực tế để hiển thị số liệu trực quan trên Grafana Dashboard.
    """
    # Thời gian nghỉ giữa các tác vụ của user ảo (0.5 - 2 giây)
    wait_time = between(0.5, 2.0)

    def on_start(self):
        """Khởi tạo headers cho mỗi người dùng ảo."""
        self.client.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    @task(6)
    def browse_products(self):
        """
        Tác vụ xem danh sách sản phẩm & tìm kiếm (Trọng số 6 - Lưu lượng đọc chính).
        Truy vấn kết hợp filter và search để ép PostgreSQL & FastAPI tính toán CPU.
        """
        categories = ["living-room", "dining", "bedroom", "workspace", "decor"]
        cat = random.choice(categories)
        search_terms = ["sofa", "ban", "ghe", "den", "go", "blanc", ""]
        kw = random.choice(search_terms)

        url = f"/products?category={cat}&search={kw}" if kw else f"/products?category={cat}"
        self.client.get(url, name="1. GET /products (Lọc & Tìm kiếm)")

    @task(4)
    def view_categories(self):
        """Tác vụ duyệt danh mục phòng (Trọng số 4)."""
        self.client.get("/categories", name="2. GET /categories (Danh mục)")

    @task(2)
    def checkout_order(self):
        """
        Tác vụ đặt hàng (Trọng số 2 - Ghi dữ liệu vào PostgreSQL & kích hoạt Worker).
        Tạo đơn hàng hoàn chỉnh với các item ngẫu nhiên.
        """
        random_id = random.randint(100, 9999)
        order_payload = {
            "customer_name": f"Khách Hàng Test #{random_id}",
            "customer_phone": f"09{random.randint(10000000, 99999999)}",
            "shipping_address": f"{random.randint(1, 200)} Đường Thử Nghiệm Tải, Quận {random.randint(1, 12)}, TP.HCM",
            "notes": "Đơn hàng tự động sinh ra bởi Locust Load Testing để kích hoạt HPA Auto-scaling",
            "payment_method": random.choice(["cod", "qr_transfer"]),
            "items": [
                {
                    "product_id": random.randint(1, 24),
                    "product_name": f"Sản Phẩm Nội Thất Mẫu #{random.randint(1, 24)}",
                    "product_image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
                    "price": float(random.randint(2000000, 18000000)),
                    "quantity": random.randint(1, 3)
                }
            ]
        }
        self.client.post("/orders", json=order_payload, name="3. POST /orders (Đặt hàng)")

    @task(1)
    def health_and_metrics_check(self):
        """Tác vụ kiểm tra Kubernetes Probes & Prometheus Metrics (Trọng số 1)."""
        self.client.get("/healthz", name="4. GET /healthz (Liveness)")
        self.client.get("/readyz", name="5. GET /readyz (Readiness)")
        self.client.get("/metrics", name="6. GET /metrics (Prometheus Scrape)")