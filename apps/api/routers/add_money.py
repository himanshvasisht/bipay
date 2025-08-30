from fastapi import APIRouter, HTTPException, Depends, Request
from db import get_db
from models import Account
from security import JWTBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

router = APIRouter()

@router.post("/add-money", dependencies=[Depends(JWTBearer())])
async def add_money(request: Request, amount_minor: int, currency: str = "INR"):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    # Extract user_id from JWT payload
    user_id = user.get("sub") or user.get("user_id") or user.get("id")
    
    account = await db.accounts.find_one({"owner_id": user_id, "currency": currency})
    if not account:
        raise HTTPException(404, "Account not found")
    new_balance = account["balance_minor"] + amount_minor
    await db.accounts.update_one({"_id": account["_id"]}, {"$set": {"balance_minor": new_balance}})
    # Log history
    from notify_utils import log_history
    await log_history(db, user_id, "add_money", {"amount_minor": amount_minor, "currency": currency})
    return {"wallet_id": account["_id"], "new_balance_minor": new_balance, "currency": currency}
