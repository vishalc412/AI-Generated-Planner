from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from typing import Optional, List
from app.middleware import get_current_user
from app.models.user import User
from app.models.plan import ImageAttachment
from app.services.plan_service import PlanService
from app.schemas.plan import PlanCreate, PlanUpdate, PlanResponse, PlanListResponse
from datetime import datetime
import boto3
from app.core.config import settings
import uuid

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.post("", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    plan_data: PlanCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new plan"""
    plan_service = PlanService()
    plan = await plan_service.create_plan(plan_data, str(current_user.id))

    plan_dict = await plan_service.get_plan_with_task_count(str(plan.id), str(current_user.id))
    plan_dict['id'] = str(plan_dict.pop('_id'))
    plan_dict['user_id'] = str(plan_dict['user_id'])

    return PlanResponse(**plan_dict)


@router.get("", response_model=PlanListResponse)
async def get_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    plan_type: Optional[str] = None,
    is_completed: Optional[bool] = None,
    priority: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all plans for current user"""
    plan_service = PlanService()
    plans, total = await plan_service.get_plans(
        str(current_user.id),
        skip=skip,
        limit=limit,
        plan_type=plan_type,
        is_completed=is_completed,
        priority=priority
    )

    # Get task counts for each plan
    plan_responses = []
    for plan in plans:
        plan_dict = await plan_service.get_plan_with_task_count(str(plan.id), str(current_user.id))
        plan_dict['id'] = str(plan_dict.pop('_id'))
        plan_dict['user_id'] = str(plan_dict['user_id'])
        plan_responses.append(PlanResponse(**plan_dict))

    return PlanListResponse(
        plans=plan_responses,
        total=total,
        page=skip // limit + 1,
        page_size=limit
    )


@router.get("/{plan_id}", response_model=PlanResponse)
async def get_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific plan"""
    plan_service = PlanService()
    plan_dict = await plan_service.get_plan_with_task_count(plan_id, str(current_user.id))

    if not plan_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )

    plan_dict['id'] = str(plan_dict.pop('_id'))
    plan_dict['user_id'] = str(plan_dict['user_id'])

    return PlanResponse(**plan_dict)


@router.put("/{plan_id}", response_model=PlanResponse)
async def update_plan(
    plan_id: str,
    plan_data: PlanUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a plan"""
    plan_service = PlanService()
    plan = await plan_service.update_plan(plan_id, str(current_user.id), plan_data)

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )

    plan_dict = await plan_service.get_plan_with_task_count(str(plan.id), str(current_user.id))
    plan_dict['id'] = str(plan_dict.pop('_id'))
    plan_dict['user_id'] = str(plan_dict['user_id'])

    return PlanResponse(**plan_dict)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a plan"""
    plan_service = PlanService()
    success = await plan_service.delete_plan(plan_id, str(current_user.id))

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )

    return None


@router.post("/{plan_id}/images", response_model=PlanResponse)
async def upload_plan_image(
    plan_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload an image to a plan"""
    # Validate file type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images are allowed."
        )

    # Read file
    contents = await file.read()
    file_size = len(contents)

    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed size"
        )

    # Upload to S3
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
    )

    file_key = f"plans/{plan_id}/{uuid.uuid4()}-{file.filename}"

    try:
        s3_client.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=file_key,
            Body=contents,
            ContentType=file.content_type
        )

        file_url = f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{file_key}"

        # Create image attachment
        image = ImageAttachment(
            url=file_url,
            filename=file.filename,
            size=file_size,
            uploaded_at=datetime.utcnow()
        )

        # Add image to plan
        plan_service = PlanService()
        plan = await plan_service.add_image_to_plan(plan_id, str(current_user.id), image)

        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found"
            )

        plan_dict = await plan_service.get_plan_with_task_count(str(plan.id), str(current_user.id))
        plan_dict['id'] = str(plan_dict.pop('_id'))
        plan_dict['user_id'] = str(plan_dict['user_id'])

        return PlanResponse(**plan_dict)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )
