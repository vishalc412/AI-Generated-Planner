from datetime import datetime, timedelta
from typing import List
from bson import ObjectId

from app.core import get_database
from app.models.notification import Notification, NotificationType


class NotificationService:
    def __init__(self):
        self.db = get_database()

    async def create_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        related_task_id: str = None,
        related_plan_id: str = None
    ) -> Notification:
        """Create a new notification"""
        notification_dict = {
            'user_id': ObjectId(user_id),
            'type': notification_type,
            'title': title,
            'message': message,
            'is_read': False,
            'created_at': datetime.utcnow()
        }

        if related_task_id:
            notification_dict['related_task_id'] = ObjectId(related_task_id)
        if related_plan_id:
            notification_dict['related_plan_id'] = ObjectId(related_plan_id)

        result = await self.db.notifications.insert_one(notification_dict)
        notification_dict['_id'] = result.inserted_id

        return Notification(**notification_dict)

    async def get_notifications(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 50,
        is_read: bool = None
    ) -> tuple[List[Notification], int, int]:
        """Get user's notifications"""
        query = {'user_id': ObjectId(user_id)}

        if is_read is not None:
            query['is_read'] = is_read

        cursor = self.db.notifications.find(query).sort('created_at', -1).skip(skip).limit(limit)
        notifications = [Notification(**doc) async for doc in cursor]
        total = await self.db.notifications.count_documents(query)
        unread_count = await self.db.notifications.count_documents({
            'user_id': ObjectId(user_id),
            'is_read': False
        })

        return notifications, total, unread_count

    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark a notification as read"""
        try:
            result = await self.db.notifications.update_one(
                {'_id': ObjectId(notification_id), 'user_id': ObjectId(user_id)},
                {'$set': {'is_read': True}}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error marking notification as read: {e}")
            return False

    async def mark_all_as_read(self, user_id: str) -> bool:
        """Mark all user's notifications as read"""
        try:
            await self.db.notifications.update_many(
                {'user_id': ObjectId(user_id), 'is_read': False},
                {'$set': {'is_read': True}}
            )
            return True
        except Exception as e:
            print(f"Error marking all notifications as read: {e}")
            return False

    async def check_and_create_due_notifications(self):
        """Check for upcoming due dates and create notifications"""
        now = datetime.utcnow()

        # Get all users with notification preferences
        users_cursor = self.db.users.find({'is_active': True})

        async for user in users_cursor:
            user_id = user['_id']
            hours_before = user.get('notification_preferences', {}).get('notification_time_before', 24)

            # Check for tasks due soon
            tasks_cursor = self.db.tasks.find({
                'user_id': user_id,
                'is_completed': False,
                'target_date': {
                    '$gte': now,
                    '$lte': now + timedelta(hours=hours_before)
                }
            })

            async for task in tasks_cursor:
                # Check if notification already exists
                existing = await self.db.notifications.find_one({
                    'user_id': user_id,
                    'related_task_id': task['_id'],
                    'type': NotificationType.TASK_DUE_SOON
                })

                if not existing:
                    await self.create_notification(
                        user_id=str(user_id),
                        notification_type=NotificationType.TASK_DUE_SOON,
                        title="Task Due Soon",
                        message=f"Your task '{task['title']}' is due soon",
                        related_task_id=str(task['_id'])
                    )

            # Check for overdue tasks
            overdue_tasks_cursor = self.db.tasks.find({
                'user_id': user_id,
                'is_completed': False,
                'target_date': {'$lt': now}
            })

            async for task in overdue_tasks_cursor:
                # Check if notification already exists
                existing = await self.db.notifications.find_one({
                    'user_id': user_id,
                    'related_task_id': task['_id'],
                    'type': NotificationType.TASK_OVERDUE
                })

                if not existing:
                    await self.create_notification(
                        user_id=str(user_id),
                        notification_type=NotificationType.TASK_OVERDUE,
                        title="Task Overdue",
                        message=f"Your task '{task['title']}' is overdue",
                        related_task_id=str(task['_id'])
                    )

            # Check for plans due soon
            plans_cursor = self.db.plans.find({
                'user_id': user_id,
                'is_completed': False,
                'target_date': {
                    '$gte': now,
                    '$lte': now + timedelta(hours=hours_before)
                }
            })

            async for plan in plans_cursor:
                existing = await self.db.notifications.find_one({
                    'user_id': user_id,
                    'related_plan_id': plan['_id'],
                    'type': NotificationType.PLAN_DUE_SOON
                })

                if not existing:
                    await self.create_notification(
                        user_id=str(user_id),
                        notification_type=NotificationType.PLAN_DUE_SOON,
                        title="Plan Due Soon",
                        message=f"Your plan '{plan['title']}' is due soon",
                        related_plan_id=str(plan['_id'])
                    )
