import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


# --- User Schemas ---

class UserModelPydantic(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username must be 3-50 characters")
    email: str = Field(..., min_length=5, max_length=100, description="Valid user email address")
    password: str = Field(..., min_length=6, max_length=100, description="Password must be at least 6 characters")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean_email = v.strip().lower()
        email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_pattern, clean_email):
            raise ValueError("Invalid email format")
        return clean_email

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        clean_username = v.strip()
        if not re.match(r"^[\w.-]+$", clean_username):
            raise ValueError("Username can only contain alphanumeric characters, dots, underscores, and dashes")
        return clean_username


class FormLoginSchema(BaseModel):
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="User password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponseModel(BaseModel):
    user_id: int
    username: str
    email: str
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


# --- Todo Schemas ---

class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Todo title")
    description: Optional[str] = Field(default="", max_length=1000, description="Detailed todo description")
    completed: bool = Field(default=False, description="Completion status")


class TodoCreateSchema(TodoBase):
    pass


class TodoUpdateSchema(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = None


class TodoResponseModelPydantic(TodoBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# Backward compatibility alias
TodoModelPydantic = TodoCreateSchema