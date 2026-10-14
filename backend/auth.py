import hashlib
import base64
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Security, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import settings, get_db
from models import UserModelDB
from schemas import (
    UserModelPydantic,
    FormLoginSchema,
    SignupResponseModel,
    LoginResponseModel,
    UserResponseModel
)

# Thử import passlib và jose nếu môi trường đã cài sẵn
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    HAS_PASSLIB = True
except ImportError:
    HAS_PASSLIB = False

try:
    from jose import jwt, JWTError
    HAS_JOSE = True
except ImportError:
    HAS_JOSE = False

security = HTTPBearer(auto_error=False)


class AuthHandler:
    """Quản lý băm mật khẩu và cấp/giải mã JWT Token."""
    def __init__(self):
        self.secret = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
        self.expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    def get_password_hash(self, password: str) -> str:
        if HAS_PASSLIB:
            return pwd_context.hash(password)
        salt = self.secret[:16]
        return "sha256$" + hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        if HAS_PASSLIB and not hashed_password.startswith("sha256$"):
            try:
                return pwd_context.verify(plain_password, hashed_password)
            except Exception:
                pass
        salt = self.secret[:16]
        expected = "sha256$" + hashlib.sha256((plain_password + salt).encode("utf-8")).hexdigest()
        return hashed_password == expected

    def encode_token(self, user_id: int) -> str:
        if HAS_JOSE:
            payload = {
                "sub": str(user_id),
                "exp": datetime.now(timezone.utc) + timedelta(minutes=self.expire_minutes),
                "iat": datetime.now(timezone.utc)
            }
            return jwt.encode(payload, self.secret, algorithm=self.algorithm)
        
        payload = {
            "sub": str(user_id),
            "exp": int(time.time()) + self.expire_minutes * 60
        }
        token_str = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8")
        sig = hashlib.sha256((token_str + self.secret).encode("utf-8")).hexdigest()[:16]
        return f"{token_str}.{sig}"

    def decode_token(self, token: str) -> int:
        if HAS_JOSE:
            try:
                payload = jwt.decode(token, self.secret, algorithms=[self.algorithm])
                user_id = payload.get("sub")
                if user_id is None:
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token payload không hợp lệ")
                return int(user_id)
            except JWTError:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không hợp lệ hoặc đã hết hạn")

        try:
            parts = token.split(".")
            if len(parts) != 2:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Định dạng token không đúng")
            token_str, sig = parts
            expected_sig = hashlib.sha256((token_str + self.secret).encode("utf-8")).hexdigest()[:16]
            if sig != expected_sig:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Chữ ký token không chính xác")
            payload = json.loads(base64.urlsafe_b64decode(token_str.encode("utf-8")).decode("utf-8"))
            if payload.get("exp", 0) < time.time():
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token đã hết hạn")
            return int(payload.get("sub"))
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không hợp lệ")

    def get_current_user_id(self, auth: Optional[HTTPAuthorizationCredentials] = Security(security)) -> int:
        if auth is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Chưa cung cấp thông tin xác thực Bearer Token"
            )
        return self.decode_token(auth.credentials)


auth_handler = AuthHandler()


def verify_admin(
    authorization: Optional[str] = Header(None),
    x_admin_demo: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> bool:
    """Xác thực quyền Quản trị viên (Admin) hoặc Demo Header."""
    if x_admin_demo == "true":
        return True

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu đăng nhập tài khoản Quản trị viên (Admin)."
        )

    token = authorization.replace("Bearer ", "").strip()
    try:
        user_id = auth_handler.decode_token(token)
        user = db.query(UserModelDB).filter(UserModelDB.user_id == user_id).first()
        if not user or user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ tài khoản Quản trị viên (Admin) mới có quyền thao tác tính năng này."
            )
        return True
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
        )


# =============================================================================
# AUTH ROUTER (Đăng ký, Đăng nhập, Profile)
# =============================================================================
auth_router = APIRouter(tags=["Authentication"])


@auth_router.post("/signup", summary="Đăng ký tài khoản khách hàng mới", response_model=SignupResponseModel, status_code=status.HTTP_201_CREATED)
@auth_router.post("/signup/", include_in_schema=False)
def signup_user(data: UserModelPydantic, db: Session = Depends(get_db)):
    if db.query(UserModelDB).filter(UserModelDB.email == data.email).first():
        raise HTTPException(status_code=400, detail="Địa chỉ email này đã được sử dụng.")
    if db.query(UserModelDB).filter(UserModelDB.username == data.username).first():
        raise HTTPException(status_code=400, detail="Tên người dùng này đã có người đăng ký.")

    new_user = UserModelDB(
        username=data.username,
        email=data.email,
        password_hash=auth_handler.get_password_hash(data.password),
        full_name=data.full_name or data.username,
        phone=data.phone or "",
        address=data.address or "",
        role="customer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = auth_handler.encode_token(new_user.user_id)
    return SignupResponseModel(access_token=token, token_type="bearer", user=new_user)


@auth_router.post("/login", summary="Đăng nhập tài khoản và nhận JWT token", response_model=LoginResponseModel)
@auth_router.post("/login/", include_in_schema=False)
def login(form_data: FormLoginSchema, db: Session = Depends(get_db)):
    user = db.query(UserModelDB).filter(UserModelDB.email == form_data.email).first()
    if not user or not auth_handler.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Email hoặc mật khẩu không chính xác.")

    token = auth_handler.encode_token(user.user_id)
    return LoginResponseModel(access_token=token, token_type="bearer", user=user)


@auth_router.get("/me", summary="Lấy thông tin tài khoản đang đăng nhập", response_model=UserResponseModel)
def get_current_user_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(auth_handler.get_current_user_id)
):
    user = db.query(UserModelDB).filter(UserModelDB.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin tài khoản.")
    return user
