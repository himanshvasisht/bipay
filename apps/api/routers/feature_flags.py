from fastapi import APIRouter, Depends, Request
from db import get_db
from security import JWTBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.get("/features", dependencies=[Depends(JWTBearer())])
async def get_features(request: Request):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    # TODO: Query user/merchant feature flags
    return {"features": ["qr", "otp", "nfc", "card"]}
