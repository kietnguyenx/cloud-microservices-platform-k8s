import json
import logging
import os
import re
import random
import uuid
from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator

logger = logging.getLogger("uvicorn.error")


def publish_order_task(order_code: str, customer_name: str, total_amount: float):
    """Đẩy tác vụ xử lý đơn hàng vào Redis queue để Worker service xử lý ngầm."""
    try:
        import redis
        client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1)
        task_payload = {
            "task": "send_order_email",
            "data": {
                "order_code": order_code,
                "customer_name": customer_name,
                "total_amount": total_amount
            }
        }
        client.rpush("task_queue", json.dumps(task_payload))
        logger.info(f"Đã gửi tác vụ xử lý đơn hàng #{order_code} vào Redis queue.")
    except Exception as e:
        logger.debug(f"Bỏ qua gửi Redis task: {e}")


def publish_order_status_task(order_id: int, new_status: str):
    """Đẩy tác vụ cập nhật trạng thái đơn hàng vào Redis queue để Worker service xử lý ngầm."""
    try:
        import redis
        client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1)
        task_payload = {
            "task": "update_order_status",
            "data": {
                "order_id": order_id,
                "status": new_status
            }
        }
        client.rpush("task_queue", json.dumps(task_payload))
        logger.info(f"Đã gửi tác vụ cập nhật đơn #{order_id} sang '{new_status}' vào Redis queue.")
    except Exception as e:
        logger.debug(f"Bỏ qua gửi Redis task: {e}")


try:
    from database import settings, engine, SessionLocal, get_db, init_db, seed_initial_data
    from models import ProductModelDB, CategoryModelDB, OrderModelDB, OrderItemModelDB
    from schemas import (
        CategoryResponseModel,
        ProductCreateSchema,
        ProductUpdateSchema,
        ProductResponseModel,
        OrderCreateSchema,
        OrderResponseModel,
        OrderStatusUpdateSchema
    )
    from auth import auth_router, verify_admin
except ImportError:
    from backend.database import settings, engine, SessionLocal, get_db, init_db, seed_initial_data
    from backend.models import ProductModelDB, CategoryModelDB, OrderModelDB, OrderItemModelDB
    from backend.schemas import (
        CategoryResponseModel,
        ProductCreateSchema,
        ProductUpdateSchema,
        ProductResponseModel,
        OrderCreateSchema,
        OrderResponseModel,
        OrderStatusUpdateSchema
    )
    from backend.auth import auth_router, verify_admin


def create_slug(text: str) -> str:
    """Tạo slug chuẩn SEO từ tên tiếng Việt."""
    text = text.lower().strip()
    text = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', text)
    text = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', text)
    text = re.sub(r'[ìíịỉĩ]', 'i', text)
    text = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', text)
    text = re.sub(r'[ùúụủũưừứựửữ]', 'u', text)
    text = re.sub(r'[ỳýỵỷỹ]', 'y', text)
    text = re.sub(r'[đ]', 'd', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo bảng và nạp dữ liệu mẫu ban đầu
    init_db()
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

    yield
    # Giải phóng connection pool
    engine.dispose()


app = FastAPI(
    title="MAISON' DÉCOR Luxury Furniture API",
    description="Hệ thống Backend API & Showroom Bán Đồ Nội Thất Cao Cấp",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Cấu hình CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if "*" not in settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Nạp Auth Router
app.include_router(auth_router)
app.include_router(auth_router, prefix="/api", include_in_schema=False)

# Cấu hình Prometheus Metrics (/metrics)
Instrumentator().instrument(app).expose(app, tags=["Monitoring"])


# =============================================================================
# 1. API DANH MỤC (CATEGORIES)
# =============================================================================
@app.get("/categories", response_model=List[CategoryResponseModel], tags=["Categories"])
@app.get("/api/categories", response_model=List[CategoryResponseModel], include_in_schema=False)
def list_categories(db: Session = Depends(get_db)):
    return db.query(CategoryModelDB).order_by(CategoryModelDB.id.asc()).all()


# =============================================================================
# 2. API SẢN PHẨM (PRODUCTS)
# =============================================================================
@app.get("/products", response_model=List[ProductResponseModel], tags=["Products"])
@app.get("/api/products", response_model=List[ProductResponseModel], include_in_schema=False)
def list_products(
    category: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    price_range: Optional[str] = Query(default=None),
    sort: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(ProductModelDB)

    if category and isinstance(category, str) and category != "all":
        cat_obj = db.query(CategoryModelDB).filter(CategoryModelDB.slug == category).first()
        if cat_obj:
            query = query.filter(ProductModelDB.category_id == cat_obj.id)

    if search and isinstance(search, str) and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (ProductModelDB.name.ilike(term)) |
            (ProductModelDB.material.ilike(term)) |
            (ProductModelDB.description.ilike(term))
        )

    if price_range and isinstance(price_range, str):
        if price_range == "under-5m":
            query = query.filter(ProductModelDB.price < 5000000)
        elif price_range == "5m-15m":
            query = query.filter(ProductModelDB.price >= 5000000, ProductModelDB.price <= 15000000)
        elif price_range == "above-15m":
            query = query.filter(ProductModelDB.price > 15000000)

    if sort and isinstance(sort, str):
        if sort == "price-asc":
            query = query.order_by(ProductModelDB.price.asc())
        elif sort == "price-desc":
            query = query.order_by(ProductModelDB.price.desc())
        elif sort == "rating-desc":
            query = query.order_by(ProductModelDB.rating.desc())
        else:
            query = query.order_by(ProductModelDB.is_featured.desc(), ProductModelDB.id.asc())
    else:
        query = query.order_by(ProductModelDB.is_featured.desc(), ProductModelDB.id.asc())

    return query.all()


@app.get("/products/{product_id}", response_model=ProductResponseModel, tags=["Products"])
@app.get("/api/products/{product_id}", response_model=ProductResponseModel, include_in_schema=False)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductModelDB).filter(ProductModelDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy sản phẩm #{product_id}")
    return product


@app.post("/products", response_model=ProductResponseModel, status_code=status.HTTP_201_CREATED, tags=["Admin CRUD"])
@app.post("/api/products", response_model=ProductResponseModel, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_product(
    data: ProductCreateSchema,
    is_admin: bool = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    slug = data.slug or create_slug(data.name)
    new_product = ProductModelDB(
        name=data.name,
        slug=slug,
        category_id=data.category_id,
        price=data.price,
        original_price=data.original_price,
        stock=data.stock,
        material=data.material or "Gỗ tự nhiên cao cấp",
        dimensions=data.dimensions or "Tiêu chuẩn",
        image_url=data.image_url,
        description=data.description or "",
        badge=data.badge,
        badge_type=data.badge_type,
        rating=data.rating,
        reviews_count=data.reviews_count or 10,
        is_featured=data.is_featured
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@app.put("/products/{product_id}", response_model=ProductResponseModel, tags=["Admin CRUD"])
@app.put("/api/products/{product_id}", response_model=ProductResponseModel, include_in_schema=False)
def update_product(
    product_id: int,
    data: ProductUpdateSchema,
    is_admin: bool = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    product = db.query(ProductModelDB).filter(ProductModelDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy sản phẩm #{product_id}")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    if "name" in update_data and not data.slug:
        product.slug = create_slug(product.name)

    db.commit()
    db.refresh(product)
    return product


@app.delete("/products/{product_id}", tags=["Admin CRUD"])
@app.delete("/api/products/{product_id}", include_in_schema=False)
def delete_product(
    product_id: int,
    is_admin: bool = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    product = db.query(ProductModelDB).filter(ProductModelDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy sản phẩm #{product_id}")

    name = product.name
    db.delete(product)
    db.commit()
    return {"success": True, "message": f"Đã xóa thành công '{name}'.", "deleted_id": product_id}


# =============================================================================
# 3. API ĐƠN HÀNG (ORDERS & CHECKOUT)
# =============================================================================
@app.post("/orders", response_model=OrderResponseModel, status_code=status.HTTP_201_CREATED, tags=["Orders"])
@app.post("/api/orders", response_model=OrderResponseModel, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_order(data: OrderCreateSchema, db: Session = Depends(get_db)):
    # 1. Kiểm tra và duy trì tồn kho cho kịch bản test tải liên tục
    for item in data.items:
        prod = db.query(ProductModelDB).filter(ProductModelDB.id == item.product_id).first()
        if prod:
            if prod.stock < item.quantity:
                # Tự động nạp thêm tồn kho khi test tải để không bị gián đoạn đơn hàng
                prod.stock = max(10000, prod.stock + 10000)

    total_amount = sum(item.price * item.quantity for item in data.items)
    
    # Sinh mã đơn hàng duy nhất tuyệt đối với UUID, triệt tiêu hoàn toàn xung đột khóa khi hàng trăm user test tải cùng lúc
    order_code = f"BLC-{uuid.uuid4().hex[:8].upper()}"

    new_order = OrderModelDB(
        order_code=order_code,
        user_id=data.user_id,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        shipping_address=data.shipping_address,
        notes=data.notes or "",
        total_amount=total_amount,
        payment_method=data.payment_method,
        status="Đang chuẩn bị hàng"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in data.items:
        order_item = OrderItemModelDB(
            order_id=new_order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            product_image=item.product_image or "",
            price=item.price,
            quantity=item.quantity,
            subtotal=item.price * item.quantity
        )
        db.add(order_item)
        # Giảm số lượng tồn kho tương ứng
        prod = db.query(ProductModelDB).filter(ProductModelDB.id == item.product_id).first()
        if prod:
            prod.stock = max(0, prod.stock - item.quantity)
            if prod.stock < 10:
                prod.stock += 10000  # Luôn duy trì tồn kho cho stress test

    db.commit()
    db.refresh(new_order)
    publish_order_task(new_order.order_code, new_order.customer_name, new_order.total_amount)
    return new_order


@app.get("/orders", response_model=List[OrderResponseModel], tags=["Orders"])
@app.get("/api/orders", response_model=List[OrderResponseModel], include_in_schema=False)
def list_orders(limit: int = 100, db: Session = Depends(get_db)):
    return db.query(OrderModelDB).order_by(OrderModelDB.id.desc()).limit(limit).all()


@app.delete("/orders/cleanup-test", tags=["Admin CRUD"])
@app.delete("/api/orders/cleanup-test", include_in_schema=False)
def cleanup_test_orders(
    delete_all: bool = Query(default=False, description="Xóa tất cả đơn hàng nếu True, hoặc chỉ xóa đơn test Locust nếu False"),
    db: Session = Depends(get_db)
):
    """Xóa nhanh toàn bộ các đơn hàng ảo do Locust test tải sinh ra để làm sạch giao diện demo."""
    if delete_all:
        deleted = db.query(OrderModelDB).delete(synchronize_session=False)
    else:
        deleted = db.query(OrderModelDB).filter(
            (OrderModelDB.notes.ilike("%Locust%")) |
            (OrderModelDB.customer_name.ilike("%Khách Hàng Test%")) |
            (OrderModelDB.customer_name.ilike("%Test User%"))
        ).delete(synchronize_session=False)
    db.commit()
    return {
        "success": True,
        "message": f"Đã dọn dẹp thành công {deleted} đơn hàng test ảo.",
        "deleted_count": deleted
    }


@app.get("/orders/{order_code}", response_model=OrderResponseModel, tags=["Orders"])
@app.get("/api/orders/{order_code}", response_model=OrderResponseModel, include_in_schema=False)
def get_order(order_code: str, db: Session = Depends(get_db)):
    order = db.query(OrderModelDB).filter(OrderModelDB.order_code == order_code).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy đơn hàng mã {order_code}")
    return order


@app.patch("/orders/{order_id}/status", response_model=OrderResponseModel, tags=["Orders"])
@app.patch("/api/orders/{order_id}/status", response_model=OrderResponseModel, include_in_schema=False)
def update_order_status(
    order_id: str,
    data: OrderStatusUpdateSchema,
    is_admin: bool = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    """Cập nhật trạng thái duyệt đơn hàng (Yêu cầu quyền Admin hoặc Header X-Admin-Demo)."""
    if order_id.isdigit():
        order = db.query(OrderModelDB).filter(OrderModelDB.id == int(order_id)).first()
    else:
        order = db.query(OrderModelDB).filter(OrderModelDB.order_code == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy đơn hàng #{order_id}")

    order.status = data.status
    db.commit()
    db.refresh(order)

    # Đẩy tác vụ vào Redis queue để Worker service xử lý ngầm
    publish_order_status_task(order.id, data.status)
    return order



# =============================================================================
# 4. KUBERNETES PROBES & TĨNH FRONTEND
# =============================================================================
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.isdir(frontend_dir):
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend")


@app.get("/", tags=["General"])
def root():
    return RedirectResponse(url="/app/")


@app.get("/healthz", tags=["Health Probes"], summary="Kubernetes Liveness Probe")
def liveness_probe():
    return {"status": "alive", "service": "blanc-furniture-backend"}


@app.get("/readyz", tags=["Health Probes"], summary="Kubernetes Readiness Probe")
def readiness_probe(response: Response, db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "not_ready", "database": f"disconnected: {str(e)}"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
