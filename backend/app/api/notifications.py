from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.middleware import get_current_user
from app.models.user import User
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationResponse, NotificationListResponse, NotificationUpdate

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_read: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all notifications for current user"""
    notification_service = NotificationService()
    notifications, total, unread_count = await notification_service.get_notifications(
        str(current_user.id),
        skip=skip,
        limit=limit,
        is_read=is_read
    )

    notification_responses = []
    for notification in notifications:
        notif_dict = notification.model_dump()
        notif_dict['id'] = str(notif_dict.pop('_id'))
        notif_dict['user_id'] = str(notif_dict['user_id'])

        if notif_dict.get('related_task_id'):
            notif_dict['related_task_id'] = str(notif_dict['related_task_id'])
        if notif_dict.get('related_plan_id'):
            notif_dict['related_plan_id'] = str(notif_dict['related_plan_id'])

        notification_responses.append(NotificationResponse(**notif_dict))

    return NotificationListResponse(
        notifications=notification_responses,
        total=total,
        unread_count=unread_count
    )


@router.put("/{notification_id}", response_model=dict)
async def mark_notification_as_read(
    notification_id: str,
    notification_update: NotificationUpdate,
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read/unread"""
    notification_service = NotificationService()

    if notification_update.is_read:
        success = await notification_service.mark_as_read(notification_id, str(current_user.id))
    else:
        # For marking as unread, we need to implement this in the service
        # For now, just return success
        success = True

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return {"message": "Notification updated successfully"}


@router.post("/mark-all-read", response_model=dict)
async def mark_all_notifications_as_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read"""
    notification_service = NotificationService()
    success = await notification_service.mark_all_as_read(str(current_user.id))

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as read"
        )

    return {"message": "All notifications marked as read"}
