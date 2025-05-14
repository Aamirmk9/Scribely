from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from models.user import User, UserUpdate
from services.auth import get_current_active_user, get_current_admin_user
from services.users import get_users, update_user, delete_user

router = APIRouter()


@router.get("/", response_model=List[User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user)
):
    """
    Retrieve users. Admin access only.
    """
    users = get_users(skip=skip, limit=limit)
    return users


@router.put("/{user_id}", response_model=User)
async def update_user_info(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a user.
    """
    # Ensure users can only update their own data unless they're admin
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own user information"
        )
    
    updated_user = update_user(user_id, user_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete a user. Admin access only.
    """
    success = delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        ) 