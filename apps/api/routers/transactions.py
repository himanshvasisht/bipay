from fastapi import APIRouter, HTTPException

router = APIRouter()

from fastapi import Request, Depends
from db import get_db
from security import JWTBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

@router.get("", dependencies=[Depends(JWTBearer())])
async def list_transactions(request: Request, owner_id: str, cursor: str = None):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    # Only allow user to view their own transactions
    if user["sub"] != owner_id:
        return {"transactions": []}
    txns = db.transactions.find({"$or": [{"from_account": user["wallet_id"]}, {"to_account": user["wallet_id"]}]}, sort=[("created_at", -1)])
    transactions = []
    running_balance = None
    async for txn in txns:
        direction = "-" if txn["from_account"] == user["wallet_id"] else "+"
        if running_balance is None:
            running_balance = txn["from_balance_minor"] if direction == "-" else txn["to_balance_minor"]
        transactions.append({
            "txn_id": str(txn["_id"]),
            "amount_minor": txn["amount_minor"],
            "currency": txn["currency"],
            "direction": direction,
            "running_balance": running_balance,
            "created_at": txn["created_at"]
        })
    return {"transactions": transactions}
