from fastapi import APIRouter, HTTPException

router = APIRouter()

from fastapi import Request, Depends
from db import get_db
from security import JWTBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

@router.get("/{txn_id}.pdf", dependencies=[Depends(JWTBearer())])
async def get_receipt(request: Request, txn_id: str):
    db: AsyncIOMotorDatabase = get_db()
    receipt = await db.receipts.find_one({"txn_id": txn_id})
    if not receipt:
        return {"pdf_url": None}
    return {"pdf_url": receipt["pdf_url"]}
