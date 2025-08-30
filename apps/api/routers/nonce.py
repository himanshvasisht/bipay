from fastapi import APIRouter, HTTPException

router = APIRouter()

from fastapi import Request, Depends
from db import get_db
from security import JWTBearer
from nonce_utils import issue_nonce
from motor.motor_asyncio import AsyncIOMotorDatabase

@router.get("", dependencies=[Depends(JWTBearer())])
async def get_nonce(request: Request, device_id: str):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    nonce = await issue_nonce(db, user["sub"], device_id)
    return {"nonce": nonce}
