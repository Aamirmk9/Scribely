import logging
from datetime import datetime
from bson import ObjectId
from typing import List, Optional, Dict, Any

from models.user import User, UserUpdate
from services.database import get_user_collection
from services.auth import get_password_hash

# Set up logging
logger = logging.getLogger(__name__)


def get_users(skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """
    Get a list of users.
    
    Args:
        skip: Number of users to skip
        limit: Maximum number of users to return
        
    Returns:
        List of user dictionaries
    """
    try:
        users_cursor = get_user_collection().find().skip(skip).limit(limit)
        return list(users_cursor)
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise


def update_user(user_id: str, user_data: UserUpdate) -> Optional[Dict[str, Any]]:
    """
    Update a user.
    
    Args:
        user_id: The ID of the user to update
        user_data: The new user data
        
    Returns:
        Updated user dictionary, or None if not found
    """
    try:
        # Prepare update data
        update_data = user_data.dict(exclude_unset=True)
        
        # Handle password hashing if provided
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        if not update_data:  # No fields to update
            return get_user_collection().find_one({"_id": ObjectId(user_id)})
        
        # Update user in database
        result = get_user_collection().update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        # Get updated user
        return get_user_collection().find_one({"_id": ObjectId(user_id)})
    
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise


def delete_user(user_id: str) -> bool:
    """
    Delete a user.
    
    Args:
        user_id: The ID of the user to delete
        
    Returns:
        True if successful, False if user not found
    """
    try:
        result = get_user_collection().delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise 