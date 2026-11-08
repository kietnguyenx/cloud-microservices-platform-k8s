# 🏛️ MAISON' DÉCOR — Cloud-Native Microservices Platform & Elastic Scaling

[![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.30+-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15--Alpine-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7--Alpine-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-v2.50+-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-v10.4+-F46800?logo=grafana&logoColor=white)](https://grafana.com/)
[![Locust](https://img.shields.io/badge/Locust-Load--Testing-008000?logo=locust&logoColor=white)](https://locust.io/)

---

## 📌 Tổng Quan Kiến Trúc (Architecture Overview)

Dự án triển khai một nền tảng thương mại điện tử nội thất cao cấp (**MAISON' DÉCOR**) theo các chuẩn mực thiết kế **Hạ tầng Cloud-Native (Cloud-Native Infrastructure)**. Hệ thống được module hóa cao độ thành các microservices độc lập, kết hợp giữa các tầng dịch vụ phi trạng thái (**Stateless Tier**), hàng đợi xử lý ngầm bất đồng bộ (**Asynchronous Event Broker**) và cơ sở dữ liệu bền vững (**StatefulSet with Persistent Volume Claim**).



## 🎯 Bảng Thông Số Kỹ Thuật (System Specifications & Resource Allocations)

| Thành phần (Workload) | Loại K8s Controller | Request (CPU / RAM) | Limit (CPU / RAM) | Cơ chế Khả dụng (HA Strategy) |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | `Deployment` | `100m` / `128Mi` | `500m` / `512Mi` | HPA v2 (Min 2, Max 10 Replicas, Threshold 70% CPU) |
| **Frontend Web** | `Deployment` | `50m` / `64Mi` | `200m` / `256Mi` | Multi-pod Deployment, Nginx HTTP Caching |
| **Worker Consumer** | `Deployment` | `50m` / `64Mi` | `250m` / `256Mi` | Event-driven Task Queue Consumer |
| **PostgreSQL DB** | `StatefulSet` | `150m` / `256Mi` | `500m` / `1Gi` | Headless Service, Dedicated Persistent Volume Claim |
| **Redis Broker** | `Deployment` | `50m` / `64Mi` | `200m` / `256Mi` | In-memory Queue với Persistence Snapshotting |
| **Monitoring Stack** | `Deployment` | `100m` / `256Mi` | `500m` / `1Gi` | Prometheus Scrape Loop 15s, Alert Rules Engine |

---

## 📋 Bảng Tra Cứu Cổng Dịch Vụ & Endpoints (Localhost Only)

Mọi dịch vụ và telemetry endpoint được cấu hình nội bộ cố định trên máy chủ phát triển (Localhost):

| Thành phần Hệ Thống | Endpoint URL (Localhost) | Giao thức / Port | Mục đích Sử dụng |
| :--- | :--- | :--- | :--- |
| **Giao diện Web Khách hàng** | [http://localhost:30080](http://localhost:30080) | HTTP / NodePort 30080 | Showroom mua sắm nội thất, giỏ hàng, checkout |
| **Giao diện Quản trị (Admin)** | [http://localhost:30080](http://localhost:30080) | HTTP / NodePort 30080 | `admin@blanc.vn` / `admin123` (Nút Quick Login) |
| **Swagger UI Documentation** | [http://localhost:8000/docs](http://localhost:8000/docs) | HTTP / Port 8000 | Tài liệu hóa tương tác 20+ REST API Endpoints |
| **Telemetry Metrics Endpoint** | [http://localhost:8000/metrics](http://localhost:8000/metrics) | HTTP / Port 8000 | OpenMetrics output phục vụ Prometheus scraping |
| **Liveness & Health Probe** | [http://localhost:8000/healthz](http://localhost:8000/healthz) | HTTP / Port 8000 | Kiểm tra tính sống còn và kết nối PostgreSQL/Redis |
| **Readiness Probe** | [http://localhost:8000/readyz](http://localhost:8000/readyz) | HTTP / Port 8000 | Xác nhận Pod đã nạp dữ liệu xong để nhận tải |
| **Grafana Dashboard** | [http://localhost:32000](http://localhost:32000) | HTTP / NodePort 32000 | `admin` / `admin123` (Giám sát RPS, P95, CPU, RAM) |
| **Prometheus Server** | [http://localhost:9090](http://localhost:9090) | HTTP / Port 9090 | PromQL console, Service Discovery targets |
| **Alertmanager UI** | [http://localhost:9093](http://localhost:9093) | HTTP / Port 9093 | Tiếp nhận cảnh báo `HighHttpErrorRate`, `PodDown` |
| **Locust Load Generator** | [http://localhost:8089](http://localhost:8089) | HTTP / Port 8089 | Điều phối tải kiểm thử kích hoạt Auto Scaling |

---

## 🛠️ Quy Trình Triển Khai Hạ Tầng (Deployment Runbooks)

### Phương án A: Triển khai Cụm Kubernetes Đa Node (Production-Grade)

#### 1. Khởi tạo Cụm k3d với Port Forwarding chuẩn
```powershell
k3d cluster create mycluster --agents 2 -p "30080:30080@loadbalancer" -p "32000:32000@loadbalancer"
```

#### 2. Nạp Docker Images vào Node Storage Cục bộ
Nhằm triệt tiêu lỗi `ImagePullBackOff` và loại bỏ hoàn toàn sự phụ thuộc vào mạng internet bên ngoài:
```powershell
k3d image import ryannguyxn/todo-backend:latest ryannguyxn/todo-frontend:latest ryannguyxn/todo-worker:latest -c mycluster
```

#### 3. Triển khai Hệ thống Cơ sở & Dịch vụ Nền tảng
Áp dụng các manifest theo đúng đồ thị phụ thuộc (DAG):
```powershell
# Bước 1: Secrets & ConfigMaps
kubectl apply -f k8s/backend-config-secret.yaml

# Bước 2: Lưu trữ bền vững & Cơ sở dữ liệu PostgreSQL
kubectl apply -f k8s/postgres-statefulset.yaml

# Bước 3: Message Queue Redis
kubectl apply -f k8s/redis-deployment.yaml

# Bước 4: Background Worker Service (Event Consumer)
kubectl apply -f k8s/worker-deployment.yaml

# Bước 5: Ứng dụng Backend API & Giao diện Frontend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Bước 6: Định tuyến Ingress
kubectl apply -f k8s/ingress.yaml
```

#### 4. Kích hoạt Hệ thống Giám sát & Tự động Co Giãn (Observability & HPA)
```powershell
# Cài đặt Metrics Server (Nền tảng đo CPU/Memory thực tế)
kubectl apply -f monitoring/metrics-server.yaml

# Kích hoạt Horizontal Pod Autoscaler cho Backend
kubectl apply -f k8s/backend-hpa.yaml

# Khởi chạy Prometheus, Alertmanager và Grafana
kubectl apply -f monitoring/prometheus-configmap.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl apply -f monitoring/alertmanager-configmap.yaml
kubectl apply -f monitoring/alertmanager-deployment.yaml
kubectl apply -f monitoring/grafana-configmap.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
```

#### 5. Xác nhận trạng thái hội tụ (System Readiness Check)
```powershell
kubectl get pods,svc,hpa -o wide
```
*Tiêu chuẩn sẵn sàng:* 10/10 Pods hiển thị trạng thái `Running (1/1)`. Cột `TARGETS` của HPA hiển thị `cpu: X%/70%`.

---

### Phương án B: Triển khai Nhanh Bằng Docker Compose (Development Mode)

Dành cho kịch bản phát triển hoặc kiểm thử nhanh bằng 1 lệnh duy nhất:
```powershell
# Khởi chạy toàn bộ 5 dịch vụ nền tảng:
docker compose up --build -d

# Kiểm tra trạng thái containers:
docker compose ps

# Dừng hệ thống:
docker compose down -v
```

---

## 📈 Kịch Bản Bắn Tải & Kiểm Chứng Auto Scaling (HPA Benchmark Protocol)

### Thuật toán Co Giãn Động của Kubernetes HPA:
$$\text{desiredReplicas} = \left\lceil \text{currentReplicas} \times \left( \frac{\text{currentMetricValue}}{\text{targetMetricValue}} \right) \right\rceil$$

### Quy trình Thực thi Kiểm thử Tải:

1. **Mở terminal giám sát HPA theo thời gian thực:**
   ```powershell
   kubectl get hpa backend-hpa -w
   ```
2. **Mở terminal giám sát chu kỳ sống của Pods:**
   ```powershell
   kubectl get pods -l app=backend -w
   ```
3. **Kích hoạt công cụ bắn tải Locust:**
   ```powershell
   locust -f load-test/locustfile.py --host=http://localhost:30080
   ```
4. **Cấu hình trên giao diện Locust ([http://localhost:8089](http://localhost:8089)):**
   * **Number of Users:** `300`
   * **Spawn Rate:** `20` (tăng 20 user/giây)
   * **Host:** `http://localhost:30080`
   * Bấm **Start Swarming**.

### Động Thái Hệ Thống Thực Tế:
* **Giai đoạn Tải đỉnh:** Khi 300 users ảo thực hiện tìm kiếm sản phẩm và đặt hàng, CPU Backend vọt lên `95% - 140%` (ngưỡng kích hoạt: `70%`).
* **Scale-up:** Kubernetes Controller Manager lập tức nhân bản Pods từ **2 Pods $\rightarrow$ 4 $\rightarrow$ 8 $\rightarrow$ tối đa 10 Pods**.
* **Phân tải:** K8s Service cân bằng tải vòng (Round-Robin) tới 10 Pods, đưa độ trễ P95 về dưới 80ms, tỷ lệ lỗi 0%.
* **Scale-down:** Sau khi bấm **Stop** trên Locust, cơ chế `stabilization-window` (300 giây) giữ ổn định cụm và hạ dần về baseline **2 Pods**.

---

## 📊 Hệ Thống Đo Lường (SRE Observability & Telemetry)

### 1. Grafana Dashboard ([http://localhost:32000](http://localhost:32000))
* **HTTP Request Rate (RPS):** Tần suất truy vấn thời gian thực theo từng API endpoint.
* **P95 Latency:** Thời gian đáp ứng của 95% request (đo lường chất lượng dịch vụ SLA/SLO).
* **HTTP Error Rate:** Tỷ lệ mã lỗi 4xx/5xx cảnh báo sự cố tức thời.
* **Pod CPU & Memory Utilization:** Đối chiếu mức độ ngốn tài nguyên giữa các replicas.

### 2. Quy Tắc Cảnh Báo (Alert Rules Engine)
* **HighHttpErrorRate (Severity: Critical):** Kích hoạt khi tỷ lệ mã lỗi 5xx vượt quá 3% liên tục trong 30 giây.
  ```promql
  sum(rate(http_requests_total{status=~"5.*"}[1m])) / sum(rate(http_requests_total[1m])) * 100 > 3
  ```
* **PodDown (Severity: Warning):** Kích hoạt khi có bất kỳ Pod nào mất tín hiệu heartbeat quá 1 phút (`up == 0`).

---

## 🛠️ Cẩm Nang Vận Hành & Lệnh PowerShell Thực Chiến (Operations Playbook)

### 1. Truy vấn tải thực tế phần cứng
```powershell
# Xem CPU / RAM tiêu thụ của từng Node:
kubectl top nodes

# Xem CPU / RAM tiêu thụ của từng Pod:
kubectl top pods
```

### 2. Truy vết Log hệ thống thời gian thực
```powershell
# Xem log Backend API với timestamp:
kubectl logs -l app=backend -f --tail=50 --timestamps

# Xem log Worker xử lý ngầm (Redis Consumer):
kubectl logs -l app=worker -f --tail=50

# Xem log Database PostgreSQL:
kubectl logs postgres-0 -f --tail=50
```

### 3. Debug sâu trạng thái tài nguyên (Resource Diagnostics)
```powershell
# Kiểm tra sự kiện điều phối và cảnh báo của HPA:
kubectl describe hpa backend-hpa

# Phân tích nguyên nhân lỗi Pod (CrashLoopBackOff, OOMKilled):
kubectl describe pod <ten-pod>
```

### 4. Quản lý trạng thái Cụm k3d hàng ngày
```powershell
# Tạm dừng cụm K3d khi nghỉ ngơi (Giải phóng 100% CPU/RAM máy tính):
k3d cluster stop mycluster

# Khởi động lại cụm K3d trong 5 giây (Bảo toàn 100% dữ liệu CSDL):
k3d cluster start mycluster
```

### 5. Dọn dẹp sạch toàn bộ tài nguyên (Teardown & Reset)
```powershell
kubectl delete -f monitoring/
kubectl delete -f k8s/
kubectl delete pvc --all
k3d cluster delete mycluster
```

### 6. Chạy Kiểm thử Đơn vị Tự động (Unit Test Suite)
```powershell
pytest backend/tests -v
```
*(Đảm bảo 100% **10/10 test cases** đều PASS trước khi triển khai production).*
