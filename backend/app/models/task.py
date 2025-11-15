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


class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    plan_id: PyObjectId
    user_id: PyObjectId
    title: str
    description: Optional[str] = None
    priority: PriorityLevel = PriorityLevel.MEDIUM
    target_date: datetime
    completed_date: Optional[datetime] = None
    is_completed: bool = False
    is_overdue: bool = False  # Computed field
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "title": "Complete project proposal",
                "description": "Finish the Q4 project proposal",
                "priority": "high",
                "target_date": "2024-12-15T17:00:00",
                "is_completed": False
            }
        }
