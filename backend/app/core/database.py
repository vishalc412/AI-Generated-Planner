from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None


db = Database()


async def connect_to_mongo():
    """Connect to MongoDB"""
    try:
        logger.info("Connecting to MongoDB...")
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE
        )
        db.db = db.client[settings.MONGODB_DB_NAME]

        # Test connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")

        # Create indexes
        await create_indexes()

    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    try:
        logger.info("Closing MongoDB connection...")
        if db.client:
            db.client.close()
        logger.info("MongoDB connection closed")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")
        raise


async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Users collection indexes
        await db.db.users.create_index("email", unique=True)
        await db.db.users.create_index("google_id", unique=True, sparse=True)
        await db.db.users.create_index("apple_id", unique=True, sparse=True)

        # Plans collection indexes
        await db.db.plans.create_index("user_id")
        await db.db.plans.create_index([("user_id", 1), ("created_at", -1)])
        await db.db.plans.create_index([("user_id", 1), ("priority", 1)])
        await db.db.plans.create_index([("user_id", 1), ("target_date", 1)])
        await db.db.plans.create_index([("user_id", 1), ("is_completed", 1)])

        # Tasks collection indexes
        await db.db.tasks.create_index("plan_id")
        await db.db.tasks.create_index([("plan_id", 1), ("created_at", -1)])
        await db.db.tasks.create_index([("plan_id", 1), ("priority", 1)])
        await db.db.tasks.create_index([("plan_id", 1), ("target_date", 1)])
        await db.db.tasks.create_index([("plan_id", 1), ("is_completed", 1)])
        await db.db.tasks.create_index([("user_id", 1), ("target_date", 1)])

        # Notifications collection indexes
        await db.db.notifications.create_index("user_id")
        await db.db.notifications.create_index([("user_id", 1), ("is_read", 1)])
        await db.db.notifications.create_index([("user_id", 1), ("created_at", -1)])

        logger.info("Database indexes created successfully")

    except Exception as e:
        logger.error(f"Error creating indexes: {e}")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db.db
