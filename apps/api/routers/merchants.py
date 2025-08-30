from fastapi import APIRouter, HTTPException

router = APIRouter()

from fastapi import Request, Depends, HTTPException
from db import get_db
from security import JWTBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import secrets

@router.post("/register", dependencies=[Depends(JWTBearer())])
async def register_merchant(request: Request, display_name: str, settlement_account: str, contact: str, webhook_url: str = ""):
    db: AsyncIOMotorDatabase = get_db()
    api_key = secrets.token_hex(32)
    merchant_doc = {
        "display_name": display_name,
        "settlement_account": settlement_account,
        "contact": contact,
        "webhook_url": webhook_url,
        "api_keys": [api_key],
        "created_at": datetime.utcnow()
    }
    merchant_id = (await db.merchants.insert_one(merchant_doc)).inserted_id
    return {"merchant_id": str(merchant_id), "api_key": api_key}

@router.post("/{id}/webhook-test", dependencies=[Depends(JWTBearer())])
async def webhook_test(request: Request, id: str):
    db: AsyncIOMotorDatabase = get_db()
    merchant = await db.merchants.find_one({"_id": id})
    if not merchant or not merchant.get("webhook_url"):
        raise HTTPException(404, "Merchant or webhook not found")
    # TODO: Send sample event to merchant webhook
    return {"status": "sent"}
