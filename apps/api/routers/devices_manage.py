from fastapi import APIRouter, Depends, Request, HTTPException
from db import get_db
from security import JWTBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.get("/devices/list", dependencies=[Depends(JWTBearer())])
async def list_devices(request: Request):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    devices = db.devices.find({"user_id": user["sub"]})
    return {"devices": [d async for d in devices]}

@router.post("/devices/revoke", dependencies=[Depends(JWTBearer())])
async def revoke_device(request: Request, device_id: str):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    await db.devices.update_one({"_id": device_id, "user_id": user["sub"]}, {"$set": {"status": "revoked"}})
    return {"status": "revoked"}
