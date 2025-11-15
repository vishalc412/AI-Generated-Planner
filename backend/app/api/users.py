from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.core import get_database

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    user_dict = current_user.model_dump()
    user_dict['id'] = str(user_dict.pop('_id'))
    return UserResponse(**user_dict)


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    from datetime import datetime
    from bson import ObjectId

    db = get_database()

    update_dict = {k: v for k, v in user_update.model_dump(exclude_unset=True).items() if v is not None}

    if not update_dict:
        user_dict = current_user.model_dump()
        user_dict['id'] = str(user_dict.pop('_id'))
        return UserResponse(**user_dict)

    update_dict['updated_at'] = datetime.utcnow()

    await db.users.update_one(
        {'_id': ObjectId(current_user.id)},
        {'$set': update_dict}
    )

    updated_user = await db.users.find_one({'_id': ObjectId(current_user.id)})
    updated_user['id'] = str(updated_user.pop('_id'))

    return UserResponse(**updated_user)
