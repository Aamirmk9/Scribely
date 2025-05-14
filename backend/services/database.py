from pymongo import MongoClient
from core.config import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

# MongoDB client
client = None


def get_database():
    """Get the MongoDB database instance."""
    global client
    if client is None:
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}")
            client = MongoClient(settings.MONGODB_URL)
            # Test connection
            client.admin.command('ping')
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    return client[settings.DATABASE_NAME]


def get_user_collection():
    """Get the users collection."""
    db = get_database()
    return db["users"]


def get_transcriptions_collection():
    """Get the transcriptions collection."""
    db = get_database()
    return db["transcriptions"]


def get_notes_collection():
    """Get the clinical notes collection."""
    db = get_database()
    return db["notes"]


def close_mongo_connection():
    """Close the MongoDB connection."""
    global client
    if client is not None:
        client.close()
        client = None
        logger.info("MongoDB connection closed") 