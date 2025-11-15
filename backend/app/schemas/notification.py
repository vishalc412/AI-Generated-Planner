from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    related_task_id: Optional[str] = None
    related_plan_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int


class NotificationUpdate(BaseModel):
    is_read: bool
