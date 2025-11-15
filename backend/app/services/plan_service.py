from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.core import get_database
from app.models.plan import Plan, ImageAttachment
from app.schemas.plan import PlanCreate, PlanUpdate, PlanResponse


class PlanService:
    def __init__(self):
        self.db = get_database()

    async def create_plan(self, plan_data: PlanCreate, user_id: str) -> Plan:
        """Create a new plan"""
        plan_dict = plan_data.model_dump()
        plan_dict['user_id'] = ObjectId(user_id)
        plan_dict['created_at'] = datetime.utcnow()
        plan_dict['updated_at'] = datetime.utcnow()
        plan_dict['is_completed'] = False
        plan_dict['images'] = []

        result = await self.db.plans.insert_one(plan_dict)
        plan_dict['_id'] = result.inserted_id

        return Plan(**plan_dict)

    async def get_plan(self, plan_id: str, user_id: str) -> Optional[Plan]:
        """Get a plan by ID"""
        try:
            plan_doc = await self.db.plans.find_one({
                '_id': ObjectId(plan_id),
                'user_id': ObjectId(user_id)
            })
            if plan_doc:
                return Plan(**plan_doc)
            return None
        except Exception as e:
            print(f"Error getting plan: {e}")
            return None

    async def get_plans(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
        plan_type: Optional[str] = None,
        is_completed: Optional[bool] = None,
        priority: Optional[str] = None
    ) -> tuple[List[Plan], int]:
        """Get user's plans with filters"""
        query = {'user_id': ObjectId(user_id)}

        if plan_type:
            query['plan_type'] = plan_type
        if is_completed is not None:
            query['is_completed'] = is_completed
        if priority:
            query['priority'] = priority

        cursor = self.db.plans.find(query).sort('created_at', -1).skip(skip).limit(limit)
        plans = [Plan(**doc) async for doc in cursor]
        total = await self.db.plans.count_documents(query)

        return plans, total

    async def update_plan(self, plan_id: str, user_id: str, plan_data: PlanUpdate) -> Optional[Plan]:
        """Update a plan"""
        try:
            update_dict = {k: v for k, v in plan_data.model_dump(exclude_unset=True).items() if v is not None}

            if not update_dict:
                return await self.get_plan(plan_id, user_id)

            update_dict['updated_at'] = datetime.utcnow()

            # If marking as completed, set completed_date
            if 'is_completed' in update_dict and update_dict['is_completed']:
                update_dict['completed_date'] = datetime.utcnow()
            elif 'is_completed' in update_dict and not update_dict['is_completed']:
                update_dict['completed_date'] = None

            result = await self.db.plans.update_one(
                {'_id': ObjectId(plan_id), 'user_id': ObjectId(user_id)},
                {'$set': update_dict}
            )

            if result.modified_count:
                return await self.get_plan(plan_id, user_id)
            return None
        except Exception as e:
            print(f"Error updating plan: {e}")
            return None

    async def delete_plan(self, plan_id: str, user_id: str) -> bool:
        """Delete a plan and its associated tasks"""
        try:
            # Delete associated tasks
            await self.db.tasks.delete_many({
                'plan_id': ObjectId(plan_id),
                'user_id': ObjectId(user_id)
            })

            # Delete plan
            result = await self.db.plans.delete_one({
                '_id': ObjectId(plan_id),
                'user_id': ObjectId(user_id)
            })

            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting plan: {e}")
            return False

    async def add_image_to_plan(self, plan_id: str, user_id: str, image: ImageAttachment) -> Optional[Plan]:
        """Add an image to a plan"""
        try:
            result = await self.db.plans.update_one(
                {'_id': ObjectId(plan_id), 'user_id': ObjectId(user_id)},
                {
                    '$push': {'images': image.model_dump()},
                    '$set': {'updated_at': datetime.utcnow()}
                }
            )

            if result.modified_count:
                return await self.get_plan(plan_id, user_id)
            return None
        except Exception as e:
            print(f"Error adding image to plan: {e}")
            return None

    async def get_plan_with_task_count(self, plan_id: str, user_id: str) -> Optional[dict]:
        """Get plan with task counts"""
        plan = await self.get_plan(plan_id, user_id)
        if not plan:
            return None

        total_tasks = await self.db.tasks.count_documents({'plan_id': ObjectId(plan_id)})
        completed_tasks = await self.db.tasks.count_documents({
            'plan_id': ObjectId(plan_id),
            'is_completed': True
        })

        plan_dict = plan.model_dump()
        plan_dict['task_count'] = total_tasks
        plan_dict['completed_task_count'] = completed_tasks

        return plan_dict
