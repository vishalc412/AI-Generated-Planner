from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.task import PriorityLevel


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: PriorityLevel = PriorityLevel.MEDIUM
    target_date: datetime


class TaskCreate(TaskBase):
    plan_id: str


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[PriorityLevel] = None
    target_date: Optional[datetime] = None
    is_completed: Optional[bool] = None


class TaskResponse(TaskBase):
    id: str
    plan_id: str
    user_id: str
    is_completed: bool
    is_overdue: bool
    completed_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    page: int
    page_size: int


class TaskSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    high_priority_tasks: int
    medium_priority_tasks: int
    low_priority_tasks: int
