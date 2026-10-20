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

    # =========================================================================
    # Đã tắt tạo đơn ảo tự động để:
    # 1. Chuẩn với thực tế các sàn TMĐT (98% lưu lượng là lướt xem và tìm kiếm).
    # 2. Giữ Database và màn hình Quản lý đơn hàng của Admin luôn sạch sẽ, gọn gàng.
    # 3. Để bạn tự tay đặt đơn thật và duyệt đơn demo cho Giảng viên.
    # =========================================================================
    # @task(2)
    # def checkout_order(self):
    #     pass

    @task(1)
    def health_and_metrics_check(self):
        """Tác vụ kiểm tra Kubernetes Probes & Prometheus Metrics (Trọng số 1)."""
        self.client.get("/healthz", name="4. GET /healthz (Liveness)")
        self.client.get("/readyz", name="5. GET /readyz (Readiness)")
        self.client.get("/metrics", name="6. GET /metrics (Prometheus Scrape)")