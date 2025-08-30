from fastapi import APIRouter, Depends, Request, HTTPException
from db import get_db
from security import JWTBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

router = APIRouter()

@router.post("/contacts/add", dependencies=[Depends(JWTBearer())])
async def add_contact(request: Request, payee_id: str, alias: str):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    await db.users.update_one({"_id": user["sub"]}, {"$push": {"contacts": {"payee_id": payee_id, "alias": alias, "added_at": datetime.utcnow()}}})
    return {"status": "added"}

@router.get("/contacts/list", dependencies=[Depends(JWTBearer())])
async def list_contacts(request: Request):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    user_doc = await db.users.find_one({"_id": user["sub"]})
    return {"contacts": user_doc.get("contacts", [])}
