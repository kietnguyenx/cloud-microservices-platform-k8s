from locust import HttpUser, task, between
import random

class WebAppUser(HttpUser):
    # Thời gian nghỉ ngơi ngẫu nhiên giữa các request của mỗi user ảo (1 - 3 giây)
    wait_time = between(1, 3)

    def on_start(self):
        """Hàm chạy đầu tiên khi 1 user ảo được sinh ra (dùng để login lấy token nếu có)"""
        self.client.headers = {"Content-Type": "application/json"}
        # Giả lập hoặc gọi endpoint đăng nhập nếu cần
        # res = self.client.post("/auth/login", json={"username": "testuser", "password": "password123"})
        # if res.status_code == 200:
        #     token = res.json().get("access_token")
        #     self.client.headers["Authorization"] = f"Bearer {token}"

    @task(3)
    def view_list(self):
        """Tác vụ đọc danh sách (chiếm tỷ lệ cao: trọng số 3)"""
        # Gọi thử endpoint danh sách (hoặc /docs /metrics để test tải ban đầu)
        self.client.get("/docs", name="Xem Swagger Docs")
        # Khi có API Todo/Product hoàn chỉnh, đổi thành:
        # self.client.get("/todos", name="Lấy danh sách Todos")

    @task(1)
    def create_item(self):
        """Tác vụ thêm mới (chiếm tỷ lệ thấp hơn: trọng số 1)"""
        payload = {
            "title": f"Công việc test tải số {random.randint(1, 1000)}",
            "description": "Nội dung kiểm thử tải Locust",
            "completed": False
        }
        # self.client.post("/todos", json=payload, name="Tạo Todo mới")

    @task(1)
    def health_check(self):
        """Kiểm tra endpoint metrics / health"""
        self.client.get("/metrics", name="Scrape Metrics")