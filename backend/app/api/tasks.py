from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.middleware import get_current_user
from app.models.user import User
from app.services.task_service import TaskService
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskSummary

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new task"""
    task_service = TaskService()
    task = await task_service.create_task(task_data, str(current_user.id))

    task_dict = task.model_dump()
    task_dict['id'] = str(task_dict.pop('_id'))
    task_dict['plan_id'] = str(task_dict['plan_id'])
    task_dict['user_id'] = str(task_dict['user_id'])

    return TaskResponse(**task_dict)


@router.get("", response_model=TaskListResponse)
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    plan_id: Optional[str] = None,
    is_completed: Optional[bool] = None,
    priority: Optional[str] = None,
    is_overdue: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all tasks for current user"""
    task_service = TaskService()
    tasks, total = await task_service.get_tasks(
        str(current_user.id),
        skip=skip,
        limit=limit,
        plan_id=plan_id,
        is_completed=is_completed,
        priority=priority,
        is_overdue=is_overdue
    )

    task_responses = []
    for task in tasks:
        task_dict = task.model_dump()
        task_dict['id'] = str(task_dict.pop('_id'))
        task_dict['plan_id'] = str(task_dict['plan_id'])
        task_dict['user_id'] = str(task_dict['user_id'])
        task_responses.append(TaskResponse(**task_dict))

    return TaskListResponse(
        tasks=task_responses,
        total=total,
        page=skip // limit + 1,
        page_size=limit
    )


@router.get("/summary", response_model=TaskSummary)
async def get_task_summary(current_user: User = Depends(get_current_user)):
    """Get task summary statistics"""
    task_service = TaskService()
    summary = await task_service.get_task_summary(str(current_user.id))
    return summary


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific task"""
    task_service = TaskService()
    task = await task_service.get_task(task_id, str(current_user.id))

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task_dict = task.model_dump()
    task_dict['id'] = str(task_dict.pop('_id'))
    task_dict['plan_id'] = str(task_dict['plan_id'])
    task_dict['user_id'] = str(task_dict['user_id'])

    return TaskResponse(**task_dict)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a task"""
    task_service = TaskService()
    task = await task_service.update_task(task_id, str(current_user.id), task_data)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task_dict = task.model_dump()
    task_dict['id'] = str(task_dict.pop('_id'))
    task_dict['plan_id'] = str(task_dict['plan_id'])
    task_dict['user_id'] = str(task_dict['user_id'])

    return TaskResponse(**task_dict)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a task"""
    task_service = TaskService()
    success = await task_service.delete_task(task_id, str(current_user.id))

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return None
