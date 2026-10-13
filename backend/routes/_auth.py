from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models._pydantic_models import (
    FormLoginSchema,
    LoginResponseModel,
    SignupResponseModel,
    UserModelPydantic,
    UserResponseModel,
)
from services._database import UserModelDB, get_db
from utils._jwt_util import auth_handler

router = APIRouter(tags=["Authentication"])


@router.post(
    "/signup",
    summary="Register a new user",
    response_model=SignupResponseModel,
    status_code=status.HTTP_201_CREATED,
)
@router.post("/signup/", include_in_schema=False)
def signup_user(data: UserModelPydantic, db: Session = Depends(get_db)):
    clean_email = data.email.lower().strip()
    clean_username = data.username.strip()

    # 1. Kiểm tra email đã đăng ký chưa
    if db.query(UserModelDB).filter(UserModelDB.email == clean_email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    # 2. Kiểm tra username đã được sử dụng chưa
    if db.query(UserModelDB).filter(UserModelDB.username == clean_username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken. Please choose another one.",
        )

    # 3. Tạo bản ghi người dùng mới
    new_user = UserModelDB(
        username=clean_username,
        email=clean_email,
        password_hash=auth_handler.get_password_hash(data.password),
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists (conflict).",
        )

    token = auth_handler.encode_token(new_user.user_id)
    return SignupResponseModel(
        access_token=token,
        token_type="bearer",
        user=new_user,
    )


@router.post(
    "/login",
    summary="Login user and receive JWT access token",
    response_model=LoginResponseModel,
)
@router.post("/login/", include_in_schema=False)
def login(form_data: FormLoginSchema, db: Session = Depends(get_db)):
    clean_email = form_data.email.lower().strip()

    # 1. Tìm user theo email
    user = db.query(UserModelDB).filter(UserModelDB.email == clean_email).first()

    # 2. Xác thực user và mật khẩu (Dùng mã 401 Unauthorized chuẩn)
    if not user or not auth_handler.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_handler.encode_token(user.user_id)
    return LoginResponseModel(
        access_token=token,
        token_type="bearer",
        user=user,
    )


@router.get(
    "/me",
    summary="Get current logged in user profile",
    response_model=UserResponseModel,
)
def get_current_user_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(auth_handler.get_current_user_id),
):
    user = db.query(UserModelDB).filter(UserModelDB.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found",
        )
    return user