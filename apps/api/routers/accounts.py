from fastapi import APIRouter, HTTPException, Depends
from db import get_db
from security import JWTBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.get("/{wallet_id}", dependencies=[Depends(JWTBearer())])
async def get_account(wallet_id: str):
    db: AsyncIOMotorDatabase = get_db()
    account = await db.accounts.find_one({"_id": wallet_id})
    if not account:
        raise HTTPException(404, "Account not found")
    
    return {
        "wallet_id": wallet_id,
        "balance_minor": account["balance_minor"],
        "currency": account["currency"],
        "status": account["status"]
    }
