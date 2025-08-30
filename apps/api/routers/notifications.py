"""
Notification Router
Endpoints for managing user notifications
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from db import get_db
from security import JWTBearer
from notification_service import NotificationService
from typing import Optional

router = APIRouter()

@router.get("/notifications", dependencies=[Depends(JWTBearer())])
async def get_notifications(
    request,
    limit: int = Query(50, le=100),
    unread_only: bool = Query(False)
):
    """Get user's notifications"""
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    user_id = user.get("sub") or user.get("user_id") or user.get("id")
    
    notifications = await NotificationService.get_user_notifications(
        db, user_id, limit, unread_only
    )
    
    return {
        "notifications": notifications,
        "count": len(notifications),
        "unread_only": unread_only
    }

@router.post("/notifications/{notification_id}/read", dependencies=[Depends(JWTBearer())])
async def mark_notification_read(
    request,
    notification_id: str
):
    """Mark notification as read"""
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    user_id = user.get("sub") or user.get("user_id") or user.get("id")
    
    success = await NotificationService.mark_notification_read(
        db, notification_id, user_id
    )
    
    if not success:
        raise HTTPException(404, "Notification not found")
    
    return {"success": True, "message": "Notification marked as read"}

@router.get("/notifications/unread/count", dependencies=[Depends(JWTBearer())])
async def get_unread_count(request):
    """Get count of unread notifications"""
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    user_id = user.get("sub") or user.get("user_id") or user.get("id")
    
    count = await db.in_app_notifications.count_documents({
        "user_id": user_id,
        "read": False
    })
    
    return {"unread_count": count}
