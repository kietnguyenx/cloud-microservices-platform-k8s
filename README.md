# 🚀 TaskMaster Pro - Cloud-Native Todo Application

Một ứng dụng Todo Full-Stack hiện đại được xây dựng bằng **FastAPI**, **PostgreSQL**, **JWT Authentication**, và **Single Page Application (SPA)** nguyên bản (Vanilla HTML5/CSS3/JavaScript), sẵn sàng 100% để triển khai trên **Docker, Kubernetes (K8s) và Auto-scaling (HPA)**.

---

## 📁 Cấu trúc Dự Án

```
fastapi-postgres-todo-api-main/
├── backend/                  # FastAPI RESTful API Service
│   ├── models/               # Pydantic Schemas v2 (validation & serialization)
│   ├── routes/               # API Router (_auth.py, _todo.py)
│   ├── services/             # SQLAlchemy ORM Database Engine & Models
│   ├── utils/                # JWT Authentication & App Configuration
│   ├── main.py               # FastAPI App Entrypoint (Lifespan, CORS, Probes)
│   ├── requirements.txt      # Python Dependencies
│   ├── .env.example          # Biến môi trường mẫu
│   ├── .env                  # Cấu hình biến môi trường local
│   └── Dockerfile            # Multi-stage Dockerfile cho Backend
├── frontend/                 # Giao diện Single Page Application (SPA)
│   ├── index.html            # Giao diện HTML5 chuẩn Semantic & Responsive
│   ├── style.css             # Thiết kế Glassmorphism & Dark Mode hiện đại
│   ├── app.js                # State Management, API Client & Toast System
│   ├── nginx.conf            # Nginx config cho SPA và Reverse Proxy API
│   └── Dockerfile            # Nginx Alpine Dockerfile cho Frontend
├── worker-service/           # Background Worker Microservice
│   ├── worker.py             # Script xử lý tác vụ nền & thống kê hệ thống
│   └── Dockerfile            # Dockerfile cho Worker
├── k8s/                      # Kubernetes Manifests (Deployment, StatefulSet, HPA)
├── load-test/                # Kịch bản kiểm thử tải với Locust
└── monitoring/               # Cấu hình Prometheus, Grafana Dashboards
```

---

## 🛠️ Hướng dẫn Khởi chạy Môi trường Local

### 1. Khởi chạy Backend (FastAPI)

#### Bước 1.1: Tạo và kích hoạt môi trường ảo (Virtual Environment)
```bash
cd backend
python -m venv venv

# Trên Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Trên Linux/macOS:
source venv/bin/activate
```

#### Bước 1.2: Cài đặt thư viện
```bash
pip install -r requirements.txt
```

#### Bước 1.3: Cấu hình biến môi trường
File `.env` đã được tạo sẵn trong thư mục `backend/`. Bạn có thể chỉnh sửa chuỗi kết nối PostgreSQL:
```env
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/todo_db
JWT_SECRET_KEY=super-secret-jwt-key-for-todo-api-development-at-least-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=4320
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080,http://127.0.0.1:5500,http://localhost:8000
```

#### Bước 1.4: Khởi động Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- **API Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Liveness Probe:** [http://localhost:8000/healthz](http://localhost:8000/healthz)
- **Readiness Probe:** [http://localhost:8000/readyz](http://localhost:8000/readyz)

---

### 2. Khởi chạy Frontend (SPA)

Frontend là ứng dụng web tĩnh hiện đại (Vanilla HTML/CSS/JS), không cần cài đặt node_modules phức tạp:

#### Cách 1: Sử dụng VS Code Live Server / Python HTTP Server
```bash
cd frontend
# Chạy HTTP Server nhanh bằng Python:
python -m http.server 3000
```
Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

#### Cách 2: Mở trực tiếp
Mở file `frontend/index.html` trực tiếp bằng trình duyệt của bạn (Chrome, Edge, Firefox).

---

## 🌟 Các Tính Năng Đã Hoàn Thiện

### Backend
- ✅ **Xác thực JWT an toàn:** Đăng ký, Đăng nhập với mật khẩu băm chuẩn bcrypt, lấy thông tin cá nhân qua `/auth/me`.
- ✅ **Toàn vẹn dữ liệu:** Tự động tạo bảng database (`init_db`), khóa ngoại `ForeignKey` giữa `users` và `todos` kèm `CASCADE DELETE`.
- ✅ **Quản lý Todo đầy đủ:**
  - Lấy danh sách kèm phân trang (`skip`, `limit`), tìm kiếm (`search`), lọc theo trạng thái (`completed`).
  - Thêm mới, xem chi tiết theo ID (`GET /todos/{id}`).
  - Cập nhật an toàn với partial update (`PUT /todos/{id}`).
  - Toggle trạng thái nhanh (`PATCH /todos/{id}/toggle`).
  - Xóa công việc vĩnh viễn (`DELETE /todos/{id}`).
- ✅ **Chuẩn Microservices & Kubernetes:**
  - Endpoint `/healthz` (Liveness) & `/readyz` (Readiness có query test DB).
  - Connection Pool PostgreSQL với `pool_pre_ping=True` chống rớt kết nối khi Auto-scaling.
  - CORS động từ biến môi trường.

### Frontend
- ✅ **Giao diện Glassmorphism cao cấp:** Dark mode thẩm mỹ cao, micro-animations, responsive trên Desktop/Tablet/Mobile.
- ✅ **Quản lý phiên đăng nhập mượt mà:** Lưu JWT token vào `localStorage`, tự động khôi phục phiên khi F5 hoặc mở lại trình duyệt.
- ✅ **Bảng điều khiển Todo trực quan:**
  - Thống kê thời gian thực: Tổng số việc, Đang làm, Đã xong, Thanh phần trăm tiến độ (%).
  - Thanh tìm kiếm và Tabs lọc công việc linh hoạt.
  - Modal chỉnh sửa công việc và Modal xác nhận xóa an toàn.
  - Cập nhật giao diện tức thì (Optimistic UI) khi toggle checkbox.
  - Hệ thống Toast notifications báo trạng thái/lỗi thân thiện.
  - Đèn báo trạng thái kết nối Backend (`Backend Online / Offline`) tự động kiểm tra mỗi 30s.

---

## 🐳 Sẵn Sàng Triển Khai Docker & Kubernetes (K8s)

- **Backend Dockerfile:** Đã tích hợp Healthcheck probe, multi-stage build sẵn sàng.
- **Frontend Dockerfile & Nginx Conf:** Đã cấu hình Nginx Alpine serving SPA và reverse proxy `/api/`.
- **Worker Service:** Đã có worker script và Dockerfile thực thi các tác vụ nền.
