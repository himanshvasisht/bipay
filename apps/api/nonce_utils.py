import time
import random
import string
from motor.motor_asyncio import AsyncIOMotorDatabase

NONCE_TTL = 60  # seconds

async def issue_nonce(db: AsyncIOMotorDatabase, user_id: str, device_id: str) -> str:
    nonce = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    expires_at = int(time.time()) + NONCE_TTL
    await db.nonces.insert_one({
        "nonce": nonce,
        "user_id": user_id,
        "device_id": device_id,
        "expires_at": expires_at,
        "used": False
    })
    return nonce

async def verify_nonce(db: AsyncIOMotorDatabase, nonce: str, user_id: str, device_id: str) -> bool:
    doc = await db.nonces.find_one({"nonce": nonce, "user_id": user_id, "device_id": device_id, "used": False})
    if not doc or doc["expires_at"] < int(time.time()):
        return False
    await db.nonces.update_one({"nonce": nonce}, {"$set": {"used": True}})
    return True
