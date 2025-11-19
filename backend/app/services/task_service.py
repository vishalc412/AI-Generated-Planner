from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from app.core import get_database
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskSummary


class TaskService:
    def __init__(self):
        self.db = get_database()

    async def create_task(self, task_data: TaskCreate, user_id: str) -> Task:
        """Create a new task"""
        task_dict = task_data.model_dump()
        task_dict['plan_id'] = ObjectId(task_dict['plan_id'])
        task_dict['user_id'] = ObjectId(user_id)
        task_dict['created_at'] = datetime.utcnow()
        task_dict['updated_at'] = datetime.utcnow()
        task_dict['is_completed'] = False
        task_dict['is_overdue'] = False

        result = await self.db.tasks.insert_one(task_dict)
        task_dict['_id'] = result.inserted_id

        return Task(**task_dict)

    async def get_task(self, task_id: str, user_id: str) -> Optional[Task]:
        """Get a task by ID"""
        try:
            task_doc = await self.db.tasks.find_one({
                '_id': ObjectId(task_id),
                'user_id': ObjectId(user_id)
            })
            if task_doc:
                # Update overdue status
                task_doc['is_overdue'] = self._check_overdue(task_doc)
                return Task(**task_doc)
            return None
        except Exception as e:
            print(f"Error getting task: {e}")
            return None

    async def get_tasks(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
        plan_id: Optional[str] = None,
        is_completed: Optional[bool] = None,
        priority: Optional[str] = None,
        is_overdue: Optional[bool] = None
    ) -> tuple[List[Task], int]:
        """Get user's tasks with filters"""
        query = {'user_id': ObjectId(user_id)}

        if plan_id:
            query['plan_id'] = ObjectId(plan_id)
        if is_completed is not None:
            query['is_completed'] = is_completed
        if priority:
            query['priority'] = priority

        cursor = self.db.tasks.find(query).sort('target_date', 1).skip(skip).limit(limit)
        tasks = []

        async for doc in cursor:
            doc['is_overdue'] = self._check_overdue(doc)
            tasks.append(Task(**doc))

        # Filter by overdue if specified
        if is_overdue is not None:
            tasks = [t for t in tasks if t.is_overdue == is_overdue]

        total = await self.db.tasks.count_documents(query)

        return tasks, total

    async def update_task(self, task_id: str, user_id: str, task_data: TaskUpdate) -> Optional[Task]:
        """Update a task"""
        try:
            update_dict = {k: v for k, v in task_data.model_dump(exclude_unset=True).items() if v is not None}

            if not update_dict:
                return await self.get_task(task_id, user_id)

            update_dict['updated_at'] = datetime.utcnow()

            # If marking as completed, set completed_date
            if 'is_completed' in update_dict and update_dict['is_completed']:
                update_dict['completed_date'] = datetime.utcnow()
            elif 'is_completed' in update_dict and not update_dict['is_completed']:
                update_dict['completed_date'] = None

            result = await self.db.tasks.update_one(
                {'_id': ObjectId(task_id), 'user_id': ObjectId(user_id)},
                {'$set': update_dict}
            )

            if result.modified_count:
                return await self.get_task(task_id, user_id)
            return None
        except Exception as e:
            print(f"Error updating task: {e}")
            return None

    async def delete_task(self, task_id: str, user_id: str) -> bool:
        """Delete a task"""
        try:
            result = await self.db.tasks.delete_one({
                '_id': ObjectId(task_id),
                'user_id': ObjectId(user_id)
            })
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting task: {e}")
            return False

    async def get_task_summary(self, user_id: str) -> TaskSummary:
        """Get task summary statistics"""
        pipeline = [
            {'$match': {'user_id': ObjectId(user_id)}},
            {'$facet': {
                'total': [{'$count': 'count'}],
                'completed': [{'$match': {'is_completed': True}}, {'$count': 'count'}],
                'pending': [{'$match': {'is_completed': False}}, {'$count': 'count'}],
                'high_priority': [{'$match': {'priority': 'high'}}, {'$count': 'count'}],
                'medium_priority': [{'$match': {'priority': 'medium'}}, {'$count': 'count'}],
                'low_priority': [{'$match': {'priority': 'low'}}, {'$count': 'count'}],
            }}
        ]

        result = await self.db.tasks.aggregate(pipeline).to_list(1)

        if not result:
            return TaskSummary(
                total_tasks=0,
                completed_tasks=0,
                pending_tasks=0,
                overdue_tasks=0,
                high_priority_tasks=0,
                medium_priority_tasks=0,
                low_priority_tasks=0
            )

        data = result[0]

        # Calculate overdue tasks
        overdue_count = await self.db.tasks.count_documents({
            'user_id': ObjectId(user_id),
            'is_completed': False,
            'target_date': {'$lt': datetime.utcnow()}
        })

        return TaskSummary(
            total_tasks=data['total'][0]['count'] if data['total'] else 0,
            completed_tasks=data['completed'][0]['count'] if data['completed'] else 0,
            pending_tasks=data['pending'][0]['count'] if data['pending'] else 0,
            overdue_tasks=overdue_count,
            high_priority_tasks=data['high_priority'][0]['count'] if data['high_priority'] else 0,
            medium_priority_tasks=data['medium_priority'][0]['count'] if data['medium_priority'] else 0,
            low_priority_tasks=data['low_priority'][0]['count'] if data['low_priority'] else 0
        )

    def _check_overdue(self, task_doc: dict) -> bool:
        """Check if task is overdue"""
        if task_doc.get('is_completed'):
            return False
        target_date = task_doc.get('target_date')
        if target_date and target_date < datetime.utcnow():
            return True
        return False
