from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

async def notify_user(db: AsyncIOMotorDatabase, user_id: str, title: str, body: str, type_: str = "payment"):
    await db.notifications.insert_one({
        "user_id": user_id,
        "type": type_,
        "title": title,
        "body": body,
        "read": False,
        "created_at": datetime.utcnow()
    })
    # TODO: Integrate with push/email/FCM

async def log_history(db: AsyncIOMotorDatabase, user_id: str, action: str, details: dict):
    await db.notifications.insert_one({
        "user_id": user_id,
        "type": "history",
        "title": action,
        "body": str(details),
        "read": True,
        "created_at": datetime.utcnow()
    })
