from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api import api_router
from app.services.notification_service import NotificationService
from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize scheduler
scheduler = AsyncIOScheduler()


async def check_notifications():
    """Background task to check for due notifications"""
    try:
        notification_service = NotificationService()
        await notification_service.check_and_create_due_notifications()
        logger.info("Notification check completed")
    except Exception as e:
        logger.error(f"Error checking notifications: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events"""
    # Startup
    logger.info("Starting up application...")
    await connect_to_mongo()

    # Schedule notification checks every hour
    scheduler.add_job(check_notifications, 'interval', hours=1, id='notification_check')
    scheduler.start()
    logger.info("Scheduler started")

    yield

    # Shutdown
    logger.info("Shutting down application...")
    scheduler.shutdown()
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
