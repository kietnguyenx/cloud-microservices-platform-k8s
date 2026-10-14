from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class UserModelDB(Base):
    """Bảng người dùng & tài khoản quản trị."""
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True, default="")
    phone = Column(String(20), nullable=True, default="")
    address = Column(String(255), nullable=True, default="")
    role = Column(String(20), nullable=False, default="customer")  # 'customer' | 'admin'
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    orders = relationship("OrderModelDB", back_populates="customer", cascade="all, delete-orphan")


class CategoryModelDB(Base):
    """Bảng danh mục không gian phòng (phòng khách, phòng ngủ, bếp...)."""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(String(500), nullable=True, default="")
    image_url = Column(String(500), nullable=True, default="")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    products = relationship("ProductModelDB", back_populates="category", cascade="all, delete-orphan")


class ProductModelDB(Base):
    """Bảng sản phẩm nội thất cao cấp."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    stock = Column(Integer, nullable=False, default=10)
    material = Column(String(200), nullable=True, default="Gỗ tự nhiên cao cấp")
    dimensions = Column(String(100), nullable=True, default="Tiêu chuẩn")
    image_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True, default="")
    badge = Column(String(50), nullable=True, default=None)  # 'Best Seller', 'Ưu Đãi -15%', 'Đặc Tuyển'...
    badge_type = Column(String(20), nullable=True, default=None)  # 'featured', 'new', 'discount'
    rating = Column(Float, default=5.0)
    reviews_count = Column(Integer, default=20)
    is_featured = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    category = relationship("CategoryModelDB", back_populates="products")


class OrderModelDB(Base):
    """Bảng đơn đặt hàng nội thất."""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_code = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True, index=True)
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    shipping_address = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True, default="")
    total_amount = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String(50), nullable=False, default="cod")
    status = Column(String(50), nullable=False, default="Đang chuẩn bị hàng")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    customer = relationship("UserModelDB", back_populates="orders")
    items = relationship("OrderItemModelDB", back_populates="order", cascade="all, delete-orphan")


class OrderItemModelDB(Base):
    """Bảng chi tiết các món hàng trong đơn."""
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, nullable=False)
    product_name = Column(String(255), nullable=False)
    product_image = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    subtotal = Column(Float, nullable=False)

    order = relationship("OrderModelDB", back_populates="items")
