import json
import logging
import os
import signal
import sys
import time
from typing import Any, Dict
import redis
from sqlalchemy import create_engine, text

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Worker] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("worker")

# Cấu hình môi trường
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://todo_user:todo_password@postgres:5432/todo_db")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
QUEUE_NAME = os.getenv("TASK_QUEUE", "task_queue")
HEARTBEAT_INTERVAL = int(os.getenv("HEARTBEAT_INTERVAL", "30"))

# Biến cờ điều khiển vòng lặp chạy nền
is_running = True


def handle_shutdown(signum, frame):
    """Xử lý tín hiệu tắt container một cách an toàn (Graceful Shutdown)."""
    global is_running
    try:
        sig_name = signal.Signals(signum).name
    except Exception:
        sig_name = str(signum)
    logger.info(f"Nhận tín hiệu dừng ({sig_name}). Đang chuẩn bị dừng worker an toàn...")
    is_running = False


try:
    signal.signal(signal.SIGINT, handle_shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, handle_shutdown)
except Exception:
    pass


def init_redis_client(max_retries: int = 10, delay: int = 3) -> redis.Redis:
    """Khởi tạo kết nối tới Redis có cơ chế thử lại (retry) và tự động fallback sang localhost nếu chạy ngoài container."""
    candidate_urls = [REDIS_URL]
    if "://redis:" in REDIS_URL:
        candidate_urls.append(REDIS_URL.replace("://redis:", "://localhost:"))
    elif "://redis" in REDIS_URL:
        candidate_urls.append(REDIS_URL.replace("://redis", "://localhost"))

    for attempt in range(1, max_retries + 1):
        for url in candidate_urls:
            try:
                logger.info(f"Đang thử kết nối Redis ({url}) - Lần {attempt}/{max_retries}...")
                client = redis.from_url(url, decode_responses=True)
                if client.ping():
                    logger.info(f"Kết nối Redis thành công ({url})!")
                    return client
            except Exception as e:
                logger.warning(f"Chưa thể kết nối Redis ({url}): {e}")
        logger.info(f"Thử lại sau {delay}s...")
        time.sleep(delay)
    logger.error("Không thể kết nối đến Redis sau nhiều lần thử.")
    sys.exit(1)


def init_database_engine(max_retries: int = 10, delay: int = 3):
    """Khởi tạo kết nối SQLAlchemy tới PostgreSQL có cơ chế retry và tự động fallback sang localhost nếu chạy ngoài container."""
    candidate_urls = [DATABASE_URL]
    if "@postgres:" in DATABASE_URL:
        candidate_urls.append(DATABASE_URL.replace("@postgres:", "@localhost:"))
    elif "@postgres" in DATABASE_URL:
        candidate_urls.append(DATABASE_URL.replace("@postgres", "@localhost"))

    for attempt in range(1, max_retries + 1):
        for url in candidate_urls:
            try:
                logger.info(f"Đang thử kết nối PostgreSQL ({url}) - Lần {attempt}/{max_retries}...")
                engine = create_engine(url, pool_pre_ping=True)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                logger.info(f"Kết nối PostgreSQL thành công ({url})!")
                return engine
            except Exception as e:
                logger.warning(f"Chưa thể kết nối PostgreSQL ({url}): {e}")
        logger.info(f"Thử lại sau {delay}s...")
        time.sleep(delay)
    logger.warning("Không thể kết nối PostgreSQL. Worker vẫn sẽ tiếp tục lắng nghe Redis queue.")
    return None


def process_task(task_data: Dict[str, Any], db_engine):
    """Xử lý tác vụ nhận được từ queue."""
    task_name = task_data.get("task", "unknown")
    payload = task_data.get("data", {})
    logger.info(f"Bắt đầu xử lý tác vụ: [{task_name}] với dữ liệu: {payload}")

    if task_name == "send_order_email":
        order_code = payload.get("order_code", "N/A")
        customer = payload.get("customer_name", "Khách hàng")
        total = payload.get("total_amount", 0)
        logger.info(f"-> Gửi email xác nhận đơn hàng #{order_code} cho {customer} (Tổng tiền: {total:,.0f} VNĐ)")

    elif task_name == "update_order_status":
        order_id = payload.get("order_id")
        new_status = payload.get("status", "Đang xử lý")
        logger.info(f"-> Cập nhật trạng thái đơn hàng #{order_id} thành '{new_status}'")
        if db_engine:
            try:
                with db_engine.begin() as conn:
                    conn.execute(
                        text("UPDATE orders SET status = :status WHERE id = :id"),
                        {"status": new_status, "id": order_id}
                    )
                logger.info(f"-> Đã cập nhật database cho đơn hàng #{order_id}")
            except Exception as ex:
                logger.error(f"-> Lỗi khi cập nhật database: {ex}")

    elif task_name == "healthcheck":
        logger.info("-> Tác vụ kiểm tra sức khỏe worker: OK")

    else:
        logger.info(f"-> Tác vụ tùy biến '{task_name}' đã được tiếp nhận và xử lý thành công.")

    logger.info(f"Hoàn thành tác vụ: [{task_name}]")


def main():
    logger.info("=" * 60)
    logger.info("Khởi động Background Worker Service")
    logger.info(f"Hàng đợi lắng nghe: '{QUEUE_NAME}'")
    logger.info("=" * 60)

    redis_client = init_redis_client()
    db_engine = init_database_engine()

    last_heartbeat = time.time()

    logger.info(f"Worker đã sẵn sàng. Đang chờ tác vụ từ queue '{QUEUE_NAME}'...")

    while is_running:
        try:
            # Nhịp tim thông báo worker vẫn đang hoạt động tốt
            now = time.time()
            if now - last_heartbeat >= HEARTBEAT_INTERVAL:
                logger.info(f"[Heartbeat] Worker đang chạy và lắng nghe hàng đợi '{QUEUE_NAME}'...")
                last_heartbeat = now

            # Sử dụng blpop để chờ nhận việc từ Redis với timeout 2 giây
            result = redis_client.blpop([QUEUE_NAME], timeout=2)
            if result:
                _, message = result
                try:
                    task_data = json.loads(message)
                except json.JSONDecodeError:
                    task_data = {"task": "raw_message", "data": {"content": message}}

                process_task(task_data, db_engine)

        except redis.ConnectionError as ce:
            logger.error(f"Mất kết nối tới Redis: {ce}. Thử kết nối lại sau 5s...")
            time.sleep(5)
            redis_client = init_redis_client(max_retries=5, delay=3)
        except Exception as e:
            logger.error(f"Lỗi không mong muốn trong worker loop: {e}", exc_info=True)
            time.sleep(2)

    logger.info("Worker service đã dừng hoàn toàn.")
    if db_engine:
        db_engine.dispose()


if __name__ == "__main__":
    main()
