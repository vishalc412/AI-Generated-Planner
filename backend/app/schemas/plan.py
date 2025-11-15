from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.plan import PlanType, PriorityLevel, ImageAttachment


class PlanBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    notes: Optional[str] = None
    plan_type: PlanType
    priority: PriorityLevel = PriorityLevel.MEDIUM
    target_date: Optional[datetime] = None


class PlanCreate(PlanBase):
    pass


class PlanUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    notes: Optional[str] = None
    plan_type: Optional[PlanType] = None
    priority: Optional[PriorityLevel] = None
    target_date: Optional[datetime] = None
    is_completed: Optional[bool] = None


class PlanResponse(PlanBase):
    id: str
    user_id: str
    is_completed: bool
    completed_date: Optional[datetime] = None
    images: List[ImageAttachment] = []
    created_at: datetime
    updated_at: datetime
    task_count: Optional[int] = 0
    completed_task_count: Optional[int] = 0

    class Config:
        from_attributes = True


class PlanListResponse(BaseModel):
    plans: List[PlanResponse]
    total: int
    page: int
    page_size: int
