import re
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator


# =============================================================================
# 1. USER & AUTH SCHEMAS
# =============================================================================
class UserModelPydantic(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Tên đăng nhập")
    email: str = Field(..., min_length=5, max_length=100, description="Email người dùng")
    password: str = Field(..., min_length=6, max_length=100, description="Mật khẩu tối thiểu 6 ký tự")
    full_name: Optional[str] = Field(default="", max_length=100, description="Họ và tên")
    phone: Optional[str] = Field(default="", max_length=20, description="Số điện thoại liên hệ")
    address: Optional[str] = Field(default="", max_length=255, description="Địa chỉ nhận hàng")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean_email = v.strip().lower()
        email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_pattern, clean_email):
            raise ValueError("Định dạng email không hợp lệ")
        return clean_email

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        clean_username = v.strip()
        if not re.match(r"^[\w.-]+$", clean_username):
            raise ValueError("Tên đăng nhập chỉ chứa ký tự chữ, số, dấu chấm, gạch dưới và gạch nối")
        return clean_username


class FormLoginSchema(BaseModel):
    email: str = Field(..., description="Email đã đăng ký")
    password: str = Field(..., description="Mật khẩu tài khoản")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponseModel(BaseModel):
    user_id: int
    username: str
    email: str
    full_name: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    role: str = "customer"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LoginResponseModel(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponseModel


class SignupResponseModel(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponseModel


# =============================================================================
# 2. CATEGORY SCHEMAS
# =============================================================================
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = ""
    image_url: Optional[str] = ""


class CategoryResponseModel(CategoryBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# 3. PRODUCT SCHEMAS
# =============================================================================
class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Tên sản phẩm nội thất")
    slug: Optional[str] = Field(default="", max_length=255, description="Slug URL")
    category_id: int = Field(..., description="ID Danh mục phòng")
    price: float = Field(..., ge=0, description="Giá bán VNĐ")
    original_price: Optional[float] = Field(default=None, ge=0, description="Giá gốc VNĐ")
    stock: int = Field(default=10, ge=0, description="Số lượng tồn kho")
    material: Optional[str] = Field(default="Gỗ tự nhiên cao cấp", description="Chất liệu sản phẩm")
    dimensions: Optional[str] = Field(default="Tiêu chuẩn", description="Kích thước sản phẩm")
    image_url: str = Field(..., min_length=5, description="URL hình ảnh sản phẩm")
    description: Optional[str] = Field(default="", description="Mô tả chi tiết")
    badge: Optional[str] = Field(default=None, description="Nhãn (Best Seller, Mới, Ưu Đãi...)")
    badge_type: Optional[str] = Field(default=None, description="Loại badge (featured, new, discount)")
    rating: float = Field(default=5.0, ge=1.0, le=5.0, description="Đánh giá từ 1.0 đến 5.0")
    reviews_count: Optional[int] = Field(default=20, ge=0, description="Số lượng lượt đánh giá")
    is_featured: bool = Field(default=False, description="Sản phẩm nổi bật")


class ProductCreateSchema(ProductBase):
    pass


class ProductUpdateSchema(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    stock: Optional[int] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    badge: Optional[str] = None
    badge_type: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    is_featured: Optional[bool] = None


class ProductResponseModel(ProductBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# 4. ORDER SCHEMAS
# =============================================================================
class OrderItemSchema(BaseModel):
    product_id: int
    product_name: str
    product_image: Optional[str] = ""
    price: float
    quantity: int = Field(default=1, ge=1)
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


class OrderCreateSchema(BaseModel):
    user_id: Optional[int] = None
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_phone: str = Field(..., min_length=8, max_length=20)
    shipping_address: str = Field(..., min_length=5, max_length=255)
    notes: Optional[str] = ""
    payment_method: str = Field(default="cod")
    items: List[OrderItemSchema] = Field(..., min_length=1)


class OrderResponseModel(BaseModel):
    id: int
    order_code: str
    user_id: Optional[int] = None
    customer_name: str
    customer_phone: str
    shipping_address: str
    notes: Optional[str] = ""
    total_amount: float
    payment_method: str
    status: str
    created_at: Optional[datetime] = None
    items: List[OrderItemSchema] = []

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdateSchema(BaseModel):
    status: str = Field(..., min_length=2, max_length=50, description="Trạng thái cập nhật (ví dụ: Đã duyệt, Đang giao hàng, Hoàn thành, Đã hủy)")

