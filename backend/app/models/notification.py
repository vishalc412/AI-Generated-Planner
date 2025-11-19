from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class NotificationType(str, Enum):
    TASK_DUE_SOON = "task_due_soon"
    TASK_OVERDUE = "task_overdue"
    PLAN_DUE_SOON = "plan_due_soon"
    PLAN_OVERDUE = "plan_overdue"
    TASK_COMPLETED = "task_completed"
    PLAN_COMPLETED = "plan_completed"


class Notification(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    type: NotificationType
    title: str
    message: str
    related_task_id: Optional[PyObjectId] = None
    related_plan_id: Optional[PyObjectId] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "type": "task_due_soon",
                "title": "Task Due Tomorrow",
                "message": "Your task 'Complete project proposal' is due tomorrow",
                "is_read": False
            }
        }
