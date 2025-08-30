from fastapi import APIRouter, Depends, Request, HTTPException
from db import get_db
from security import JWTBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

router = APIRouter()

@router.post("/payments/schedule", dependencies=[Depends(JWTBearer())])
async def schedule_payment(request: Request, to_account: str, amount_minor: int, currency: str, scheduled_for: datetime, memo: str = ""):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    await db.scheduled_payments.insert_one({
        "user_id": user["sub"],
        "to_account": to_account,
        "amount_minor": amount_minor,
        "currency": currency,
        "scheduled_for": scheduled_for,
        "memo": memo,
        "status": "pending",
        "created_at": datetime.utcnow()
    })
    return {"status": "scheduled"}

@router.get("/payments/scheduled", dependencies=[Depends(JWTBearer())])
async def list_scheduled_payments(request: Request):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    payments = db.scheduled_payments.find({"user_id": user["sub"]})
    return {"scheduled_payments": [p async for p in payments]}
