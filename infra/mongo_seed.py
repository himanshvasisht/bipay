# BiPay Seed Script

from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime

async def seed():
    client = AsyncIOMotorClient("mongodb://localhost:27017/bipay")
    db = client.get_default_database()
    await db.users.insert_one({
        "_id": "user1",
        "full_name": "Test User",
        "phone": "9999999999",
        "email": "test@bipay.com",
        "kyc_status": "verified",
        "wallet_id": "wallet1",
        "created_at": datetime.utcnow()
    })
    print("Seeded test user.")

if __name__ == "__main__":
    asyncio.run(seed())
