from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    auth_provider: str
    google_id: Optional[str] = None
    apple_id: Optional[str] = None
    profile_picture: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    notification_preferences: Optional[dict] = None


class UserResponse(UserBase):
    id: str
    profile_picture: Optional[str] = None
    auth_provider: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    notification_preferences: dict

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
