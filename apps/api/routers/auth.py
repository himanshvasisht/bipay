from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from db import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from security import create_jwt_token
import secrets
import hashlib

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    mobile: str
    password: str
    email: str = None

class LoginRequest(BaseModel):
    mobile: str
    password: str

@router.post("/register")
async def register(request: RegisterRequest):
    try:
        db: AsyncIOMotorDatabase = get_db()
        
        # Check if user already exists
        existing_user = await db.users.find_one({"mobile": request.mobile})
        if existing_user:
            raise HTTPException(400, "User with this mobile number already exists")
        
        user_id = secrets.token_hex(16)
        wallet_id = f"wallet_{user_id}"
        
        # Hash password (simple hash for demo)
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        
        # Create user
        user_doc = {
            "_id": user_id,
            "full_name": request.name,
            "mobile": request.mobile,
            "email": request.email or f"{request.mobile}@bipay.demo",
            "password_hash": password_hash,
            "kyc_status": "pending",
            "wallet_id": wallet_id,
            "balance": 1000,  # Demo balance
            "created_at": datetime.utcnow()
        }
        
        await db.users.insert_one(user_doc)
        
        # Create wallet account
        await db.accounts.insert_one({
            "_id": wallet_id,
            "user_id": user_id,
            "balance_minor": 100000,  # ₹1000 demo balance
            "currency": "INR",
            "status": "active",
            "created_at": datetime.utcnow()
        })
        
        # Generate JWT token
        token_data = {
            "user_id": user_id,
            "mobile": request.mobile,
            "wallet_id": wallet_id
        }
        jwt_token = create_jwt_token(token_data)
        
        return {
            "success": True,
            "data": {
                "user": {
                    "id": user_id,
                    "name": request.name,
                    "full_name": request.name,
                    "mobile": request.mobile,
                    "balance": 1000,
                    "wallet_id": wallet_id
                },
                "token": jwt_token,
                "device_id": f"web_device_{user_id}"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Registration failed: {str(e)}")

@router.post("/login")
async def login(request: LoginRequest):
    try:
        db: AsyncIOMotorDatabase = get_db()
        
        # Find user by mobile
        user = await db.users.find_one({"mobile": request.mobile})
        if not user:
            raise HTTPException(404, "User not found")
        
        # Verify password
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        if user.get("password_hash") != password_hash:
            raise HTTPException(401, "Invalid password")
        
        # Generate JWT token
        token_data = {
            "user_id": user["_id"],
            "mobile": user["mobile"],
            "wallet_id": user["wallet_id"]
        }
        jwt_token = create_jwt_token(token_data)
        
        return {
            "success": True,
            "data": {
                "user": {
                    "id": user["_id"],
                    "name": user["full_name"],
                    "full_name": user["full_name"],
                    "mobile": user["mobile"],
                    "balance": user.get("balance", 1000),
                    "wallet_id": user["wallet_id"]
                },
                "token": jwt_token,
                "device_id": f"web_device_{user['_id']}"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Login failed: {str(e)}")
