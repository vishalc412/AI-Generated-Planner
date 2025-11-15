from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .plans import router as plans_router
from .tasks import router as tasks_router
from .notifications import router as notifications_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(plans_router)
api_router.include_router(tasks_router)
api_router.include_router(notifications_router)

__all__ = ["api_router"]
