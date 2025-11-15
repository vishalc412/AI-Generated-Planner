from datetime import datetime
from typing import Optional, List
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


class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class PlanType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class ImageAttachment(BaseModel):
    url: str
    filename: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    size: int  # in bytes


class Plan(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    title: str
    description: Optional[str] = None
    notes: Optional[str] = None  # Rich text notes similar to Keynote
    plan_type: PlanType
    priority: PriorityLevel = PriorityLevel.MEDIUM
    target_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    is_completed: bool = False
    images: List[ImageAttachment] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "title": "Weekly Work Plan",
                "description": "Tasks for this week",
                "plan_type": "weekly",
                "priority": "high",
                "target_date": "2024-12-31T23:59:59",
                "is_completed": False
            }
        }
