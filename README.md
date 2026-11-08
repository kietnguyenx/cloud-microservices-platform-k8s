# 🏛️ MAISON' DÉCOR — Cloud-Native Microservices Platform & Elastic Scaling

[![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.30+-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15--Alpine-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7--Alpine-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-v2.50+-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-v10.4+-F46800?logo=grafana&logoColor=white)](https://grafana.com/)
[![Locust](https://img.shields.io/badge/Locust-Load--Testing-008000?logo=locust&logoColor=white)](https://locust.io/)

Nền tảng thương mại điện tử nội thất trực tuyến (**MAISON' DÉCOR**) được thiết kế theo chuẩn kiến trúc **Cloud-Native**. Hệ thống phân tách thành các microservices độc lập, hỗ trợ tự động co giãn theo tải (Horizontal Pod Autoscaler), xử lý tác vụ bất đồng bộ qua message queue, và tích hợp sẵn bộ công cụ giám sát đo lường toàn diện (Full-Stack Observability).

---

## 📌 Điểm Nhấn Kiến Trúc (Architecture Highlights)

* **Stateless API Tier:** Backend FastAPI phi trạng thái, hỗ trợ nhân bản đa luồng không phụ thuộc phiên làm việc, tối ưu hóa cho co giãn động.
* **Asynchronous Event-Driven Broker:** Tách rời logic đặt hàng và thanh toán khỏi các tác vụ ngầm (gửi email, tính toán tồn kho, analytics) thông qua Redis Task Queue và Worker Service chuyên trách.
* **Persistent Storage Resilience:** Cơ sở dữ liệu PostgreSQL triển khai dạng `StatefulSet` với `PersistentVolumeClaim (PVC)` và `Headless Service`, đảm bảo tính toàn vẹn dữ liệu và định danh mạng cố định.
* **Elastic Autoscaling (HPA v2):** Tự động điều chỉnh số lượng Pods backend từ 2 đến 10 dựa trên chỉ số CPU thực tế đo lường bởi Metrics Server.
* **Zero-Downtime Traffic Routing:** Ingress Controller kết hợp Kubernetes Service định tuyến lưu lượng thông minh, hỗ trợ sẵn Liveness/Readiness probes nhằm loại trừ downtime khi cập nhật phiên bản.
* **Full-Stack Observability:** Thu thập telemetry tự động qua OpenMetrics/Prometheus, trực quan hóa trên Grafana Dashboard và kích hoạt cảnh báo sự cố qua Alertmanager.

---

## 🏗️ Phân Tách Dịch Vụ (Microservices Breakdown)

1. **Frontend Service (`Nginx + SPA`):**
   * Phục vụ giao diện khách hàng và bảng điều khiển quản trị (Admin Dashboard).
   * Cấu hình Nginx reverse proxy, gzip compression và client-side cache headers tối ưu hóa tốc độ tải trang.
2. **Backend API Service (`FastAPI + SQLAlchemy`):**
   * Quản lý danh mục sản phẩm, người dùng, giỏ hàng, xác thực bảo mật JWT OAuth2 và đơn hàng.
   * Xuất metric OpenMetrics tự động tại endpoint `/metrics` phục vụ Prometheus scrape.
3. **Worker Service (`Python Background Consumer`):**
   * Lắng nghe và tiêu thụ hàng đợi từ Redis (BRPOP/BLPOP pattern).
   * Xử lý bất đồng bộ các tác vụ nặng, giả lập gửi email xác nhận và cập nhật trạng thái đơn hàng.
4. **Data Persistence Tier (`PostgreSQL 15 StatefulSet`):**
   * Đảm bảo tính nhất quán dữ liệu ACID, cơ chế tự động khởi tạo dữ liệu mẫu (auto-seeding) an toàn cho môi trường demo và testing.
5. **Caching & Broker Tier (`Redis 7 Alpine`):**
   * Làm message broker điều phối tác vụ ngầm giữa Backend và Worker, kết hợp lưu trữ snapshot RDB bền vững.
6. **Observability Stack (`Prometheus + Grafana + Alertmanager + Metrics Server`):**
   * Giám sát liên tục lưu lượng RPS, độ trễ P95/P99, tỷ lệ lỗi HTTP 4xx/5xx và mức độ tiêu thụ CPU/RAM từng Pod.

---

## 🎯 Thông Số Kỹ Thuật & Cấu Hình Tài Nguyên (Resource Allocations)

| Thành phần (Workload) | Controller | Replicas | Requests (CPU / RAM) | Limits (CPU / RAM) | Chiến lược Vận hành |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend API** | `Deployment` | 2 – 10 (HPA) | `100m` / `128Mi` | `500m` / `512Mi` | Tự động scale khi CPU > 70% |
| **Frontend Web** | `Deployment` | 1 | `50m` / `64Mi` | `200m` / `256Mi` | Nginx Alpine, HTTP caching |
| **Worker Service** | `Deployment` | 1 | `50m` / `64Mi` | `250m` / `256Mi` | Event-driven Task Queue Consumer |
| **PostgreSQL DB** | `StatefulSet` | 1 | `150m` / `256Mi` | `500m` / `1Gi` | Headless Service + PVC Storage |
| **Redis Broker** | `Deployment` | 1 | `50m` / `64Mi` | `200m` / `256Mi` | In-memory Queue + Persistence |
| **Monitoring Stack** | `Deployment` | 1 each | `100m` / `256Mi` | `500m` / `1Gi` | Prometheus (15s scrape), Alertmanager, Grafana |

---

## 🌐 Danh Mục Cổng Truy Cập (Endpoints Directory)

Tất cả các dịch vụ đã được chuẩn hóa để truy cập trên môi trường local:

| Dịch vụ | Địa chỉ truy cập | Giao thức / Cổng | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Giao diện Người dùng (Web)** | `http://localhost:30080` | HTTP (NodePort 30080) | Showroom nội thất, danh mục, đặt hàng |
| **Tài khoản Quản trị (Admin)** | `http://localhost:30080` | Web UI | `admin@blanc.vn` / `admin123` (Nút Quick Login) |
| **Interactive API Docs (Swagger)** | `http://localhost:8000/docs` | HTTP (Port 8000) | OpenAPI 3.0 Spec đầy đủ cho toàn bộ endpoints |
| **Telemetry Metrics Endpoint** | `http://localhost:8000/metrics` | HTTP (Port 8000) | Prometheus/OpenMetrics scraper |
| **Health Check (Liveness)** | `http://localhost:8000/healthz` | HTTP (Port 8000) | Kiểm tra kết nối Database & Cache |
| **Readiness Probe** | `http://localhost:8000/readyz` | HTTP (Port 8000) | Xác nhận Pod sẵn sàng nhận traffic |
| **Grafana Dashboard** | `http://localhost:32000` | HTTP (NodePort 32000) | `admin` / `admin123` (Giám sát RPS, P95, CPU, RAM) |
| **Prometheus Server** | `http://localhost:9090` | HTTP (Port 9090) | PromQL Console & Target Discovery |
| **Alertmanager UI** | `http://localhost:9093` | HTTP (Port 9093) | Quản lý và tiếp nhận alert notifications |
| **Locust Load Testing UI** | `http://localhost:8089` | HTTP (Port 8089) | Điều phối kịch bản bắn tải kiểm thử HPA |

---

## 🚀 Hướng Dẫn Triển Khai (Deployment Guide)

### Cách 1: Triển khai trên Kubernetes (Khuyến nghị cho Production/Demo)

Yêu cầu: Đã cài đặt `k3d` (hoặc Minikube/Kind) và `kubectl`.

#### Bước 1: Khởi tạo cụm Kubernetes với Port Mapping
```powershell
k3d cluster create mycluster --agents 2 -p "30080:30080@loadbalancer" -p "32000:32000@loadbalancer"
```

#### Bước 2: Nạp Images vào cụm (Tránh lỗi ImagePullBackOff)
```powershell
k3d image import ryannguyxn/todo-backend:latest ryannguyxn/todo-frontend:latest ryannguyxn/todo-worker:latest -c mycluster
```

#### Bước 3: Áp dụng K8s Manifests theo thứ tự phụ thuộc
```powershell
# 1. ConfigMap và Secret
kubectl apply -f k8s/backend-config-secret.yaml

# 2. Cơ sở dữ liệu và Message Broker
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/redis-deployment.yaml

# 3. Microservices ứng dụng
kubectl apply -f k8s/worker-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# 4. Hạ tầng Giám sát & Tự động Co giãn (Metrics Server + HPA + Monitoring)
kubectl apply -f monitoring/metrics-server.yaml
kubectl apply -f k8s/backend-hpa.yaml
kubectl apply -f monitoring/prometheus-configmap.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl apply -f monitoring/alertmanager-configmap.yaml
kubectl apply -f monitoring/alertmanager-deployment.yaml
kubectl apply -f monitoring/grafana-configmap.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
```

#### Bước 4: Kiểm tra trạng thái triển khai
```powershell
kubectl get pods,svc,hpa -o wide
```
> [!TIP]
> Trạng thái lý tưởng: Toàn bộ Pods ở trạng thái `Running (1/1)` và HPA cột `TARGETS` nhận giá trị CPU hợp lệ (ví dụ: `cpu: 2%/70%`).

---

### Cách 2: Triển khai nhanh với Docker Compose (Local Development)

Yêu cầu: Docker Desktop đang chạy.

```powershell
# Khởi chạy toàn bộ hệ thống ở chế độ nền:
docker compose up --build -d

# Xem log các dịch vụ:
docker compose logs -f

# Dừng và giải phóng tài nguyên:
docker compose down -v
```

---

## ⚡ Kịch Bản Bắn Tải & Kiểm Chứng HPA (Load Testing Protocol)

Dự án cung cấp kịch bản tải thực tế viết bằng **Locust** (`load-test/locustfile.py`) để mô phỏng hành vi người dùng (tìm kiếm sản phẩm, xem chi tiết, thêm giỏ hàng, checkout):

1. **Mở terminal theo dõi phản ứng HPA:**
   ```powershell
   kubectl get hpa backend-hpa -w
   ```
2. **Mở terminal theo dõi quá trình sinh Pods:**
   ```powershell
   kubectl get pods -l app=backend -w
   ```
3. **Khởi chạy Locust Generator:**
   ```powershell
   locust -f load-test/locustfile.py --host=http://localhost:30080
   ```
4. **Thiết lập tham số trên giao diện Locust (`http://localhost:8089`):**
   * **Number of Users:** `300`
   * **Spawn Rate:** `20` (tăng dần 20 users/giây)
   * Nhấn **Start Swarming**.

### Chu trình Co Giãn Quan Sát Được:
* **Scale-up:** Khi CPU Pod vượt ngưỡng 70% (đạt đỉnh khoảng 95% - 130%), Kubernetes HPA tự động kích hoạt nhân bản từ **2 Pods $\rightarrow$ 4 $\rightarrow$ 8 $\rightarrow$ 10 Pods**.
* **Ổn định hệ thống:** Cụm phân tải đồng đều, giữ vững tỷ lệ thành công 100%, độ trễ P95 phản hồi nhanh chóng dưới 100ms.
* **Scale-down:** Sau khi dừng tải, Kubernetes áp dụng thời gian chờ (`stabilizationWindowSeconds: 300`) để chống hiện tượng co giãn giật cục (flapping/thrashing), sau đó từ từ hạ số lượng Pod về mức cơ sở **2 Pods**.

---

## 📊 Giám Sát SRE & Quy Tắc Cảnh Báo (Observability & Alerting)

### 1. Chỉ Số Đo Lường Chính (Golden Signals trên Grafana)
* **Traffic (RPS):** Tần suất HTTP requests thời gian thực theo từng API endpoint.
* **Latency (P95/P99):** Độ trễ xử lý của 95% và 99% người dùng.
* **Errors (HTTP Error Rate):** Tỷ lệ các mã lỗi HTTP 4xx và 5xx.
* **Saturation (CPU / Memory Usage):** Mức độ ngốn tài nguyên giữa các Pods backend và nodes.

### 2. Bộ Quy Tắc Cảnh Báo Tự Động (Alertmanager Rules)
* **`HighHttpErrorRate` (Critical):** Kích hoạt khi tỷ lệ lỗi HTTP 5xx vượt quá 3% trong 30 giây liên tiếp:
  ```promql
  sum(rate(http_requests_total{status=~"5.*"}[1m])) / sum(rate(http_requests_total[1m])) * 100 > 3
  ```
* **`PodDown` (Warning):** Kích hoạt khi có bất kỳ Pod nào không phản hồi heartbeat trong hơn 1 phút (`up == 0`).

---

## 🛠️ Cẩm Nang Vận Hành Thường Nhật (Operations Playbook)

```powershell
# 1. Đo lường tài nguyên thực tế
kubectl top nodes
kubectl top pods

# 2. Truy vết log thời gian thực
kubectl logs -l app=backend -f --tail=50 --timestamps
kubectl logs -l app=worker -f --tail=50
kubectl logs postgres-0 -f --tail=50

# 3. Chẩn đoán chi tiết tài nguyên
kubectl describe hpa backend-hpa
kubectl describe pod <ten-pod>

# 4. Quản lý trạng thái cụm k3d (tiết kiệm RAM khi không dùng)
k3d cluster stop mycluster    # Tạm dừng cụm (giải phóng 100% CPU/RAM)
k3d cluster start mycluster   # Khởi động lại (bảo toàn toàn bộ dữ liệu CSDL)

# 5. Dọn dẹp sạch toàn bộ tài nguyên
kubectl delete -f monitoring/
kubectl delete -f k8s/
kubectl delete pvc --all
k3d cluster delete mycluster

# 6. Chạy bộ kiểm thử tự động (Unit Tests)
pytest backend/tests -v
```

---

## 📁 Cấu Trúc Thư Mục Dự Án (Repository Layout)

```text
├── .github/workflows/         # CI/CD pipeline tự động kiểm thử và build Docker
├── backend/                   # FastAPI application source code
│   ├── tests/                 # Bộ kiểm thử đơn vị (Pytest test suite)
│   ├── auth.py                # Xử lý xác thực JWT & phân quyền Role-based
│   ├── database.py            # Kết nối PostgreSQL & cấu hình SQLAlchemy
│   ├── models.py              # Định nghĩa ORM Database Models
│   ├── schemas.py             # Pydantic Schemas xác thực dữ liệu đầu vào/ra
│   └── main.py                # REST API routes & OpenMetrics instrumentation
├── frontend/                  # Single Page Application (HTML5, Modern CSS, Vanilla JS)
│   ├── nginx.conf             # Cấu hình Nginx Web Server & Caching
│   └── Dockerfile             # Multi-stage Docker build cho Frontend
├── k8s/                       # Kubernetes Declarative Manifests
│   ├── backend-config-secret.yaml  # ConfigMap & Secrets môi trường
│   ├── backend-deployment.yaml     # Deployment & Service cho Backend
│   ├── backend-hpa.yaml            # Cấu hình Horizontal Pod Autoscaler v2
│   ├── frontend-deployment.yaml    # Deployment & Service cho Frontend
│   ├── postgres-statefulset.yaml   # StatefulSet + Headless Service + PVC
│   ├── redis-deployment.yaml       # Deployment & Service cho Message Broker
│   ├── worker-deployment.yaml      # Deployment cho Background Consumer
│   └── ingress.yaml                # Cấu hình Ingress Routing
├── monitoring/                # Hệ thống Giám sát & Đo lường
│   ├── metrics-server.yaml         # K8s Metrics Server cho HPA
│   ├── prometheus-*.yaml           # Deployment & Scrape Config của Prometheus
│   ├── alertmanager-*.yaml         # Cảnh báo sự cố Alertmanager
│   ├── grafana-*.yaml              # Grafana Service & ConfigMap
│   └── dashboards/                 # JSON file dựng sẵn Dashboard Grafana
├── worker-service/            # Worker xử lý tác vụ ngầm từ Redis queue
├── load-test/                 # Kịch bản kiểm thử tải với Locust
├── docker-compose.yml         # Thiết lập chạy nhanh môi trường Local
├── .dockerignore              # Danh sách loại trừ khi đóng gói container
└── .gitignore                 # Danh sách loại trừ phiên bản Git
```

---

## 📜 Giấy Phép & Tác Quyền (License)

Dự án được phân phối dưới giấy phép **MIT License**. Mọi quyền được bảo lưu.
