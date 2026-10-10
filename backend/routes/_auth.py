from fastapi import HTTPException, Depends, status, APIRouter
from sqlalchemy.orm import Session
from services._database import UserModelDB, get_db
from models._pydantic_models import (
    UserModelPydantic,
    FormLoginSchema,
    SignupResponseModel,
    LoginResponseModel,
    UserResponseModel
)
from utils._jwt_util import auth_handler

router = APIRouter(tags=['Authentication'])


@router.post("/signup", summary="Register a new user", response_model=SignupResponseModel, status_code=status.HTTP_201_CREATED)
@router.post("/signup/", include_in_schema=False)
def signup_user(data: UserModelPydantic, db: Session = Depends(get_db)):
    # 1. Check if email is already registered
    existing_email = db.query(UserModelDB).filter(UserModelDB.email == data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    # 2. Check if username is already taken
    existing_username = db.query(UserModelDB).filter(UserModelDB.username == data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken. Please choose another one.",
        )

    # 3. Create user record
    new_user = UserModelDB(
        username=data.username,
        email=data.email,
        password_hash=auth_handler.get_password_hash(data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = auth_handler.encode_token(new_user.user_id)
    return SignupResponseModel(
        access_token=token,
        token_type="bearer",
        user=new_user
    )


@router.post("/login", summary="Login user and receive JWT access token", response_model=LoginResponseModel)
@router.post("/login/", include_in_schema=False)
def login(form_data: FormLoginSchema, db: Session = Depends(get_db)):
    # 1. Find user by email
    user = db.query(UserModelDB).filter(UserModelDB.email == form_data.email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )

    # 2. Verify password
    if not auth_handler.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )

    token = auth_handler.encode_token(user.user_id)
    return LoginResponseModel(
        access_token=token,
        token_type="bearer",
        user=user
    )


@router.get("/me", summary="Get current logged in user profile", response_model=UserResponseModel)
def get_current_user_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(auth_handler.get_current_user_id)
):
    user = db.query(UserModelDB).filter(UserModelDB.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")
    return user
