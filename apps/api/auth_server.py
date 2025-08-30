"""
Simple BiPay Auth API for testing login/registration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import secrets
import hashlib
import json
import uvicorn

app = FastAPI(title="BiPay Auth API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
users_db = {}

class RegisterRequest(BaseModel):
    name: str
    mobile: str
    password: str
    email: str = None

class LoginRequest(BaseModel):
    mobile: str
    password: str

@app.get("/")
def root():
    return {"message": "BiPay Auth API is running!", "status": "success"}

@app.get("/health")
def health():
    return {"status": "healthy", "service": "BiPay Auth"}

@app.post("/v1/auth/register")
async def register(request: RegisterRequest):
    try:
        # Check if user already exists
        if request.mobile in users_db:
            raise HTTPException(400, detail="User with this mobile number already exists")
        
        user_id = secrets.token_hex(16)
        wallet_id = f"wallet_{user_id}"
        
        # Hash password
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        
        # Store user
        user_data = {
            "id": user_id,
            "name": request.name,
            "full_name": request.name,
            "mobile": request.mobile,
            "email": request.email or f"{request.mobile}@bipay.demo",
            "password_hash": password_hash,
            "wallet_id": wallet_id,
            "balance": 1000,  # Demo balance ₹1000
            "created_at": datetime.utcnow().isoformat()
        }
        
        users_db[request.mobile] = user_data
        
        # Generate simple JWT token
        jwt_token = f"jwt_{user_id}_{secrets.token_hex(8)}"
        
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
        raise HTTPException(500, detail=f"Registration failed: {str(e)}")

@app.post("/v1/auth/login")
async def login(request: LoginRequest):
    try:
        # Find user
        if request.mobile not in users_db:
            raise HTTPException(404, detail="User not found")
        
        user = users_db[request.mobile]
        
        # Verify password
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        if user["password_hash"] != password_hash:
            raise HTTPException(401, detail="Invalid password")
        
        # Generate JWT token
        jwt_token = f"jwt_{user['id']}_{secrets.token_hex(8)}"
        
        return {
            "success": True,
            "data": {
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "full_name": user["full_name"],
                    "mobile": user["mobile"],
                    "balance": user["balance"],
                    "wallet_id": user["wallet_id"]
                },
                "token": jwt_token,
                "device_id": f"web_device_{user['id']}"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, detail=f"Login failed: {str(e)}")

@app.post("/v1/auth/logout")
async def logout():
    return {
        "success": True,
        "message": "Logged out successfully"
    }

@app.get("/v1/auth/test")
def test_auth():
    return {
        "message": "Auth API is working!",
        "registered_users": len(users_db),
        "endpoints": [
            "POST /v1/auth/register",
            "POST /v1/auth/login", 
            "POST /v1/auth/logout"
        ]
    }

@app.get("/v1/nonce")
def get_nonce(device_id: str):
    """Generate nonce for biometric operations"""
    nonce = secrets.token_hex(16)
    return {
        "success": True,
        "data": {
            "nonce": nonce,
            "device_id": device_id,
            "expires_in": 300  # 5 minutes
        }
    }

# Add some sample payment endpoints that the UI might call
@app.get("/v1/accounts/balance")
def get_balance():
    return {
        "success": True,
        "data": {
            "balance": 1000,
            "currency": "INR"
        }
    }

@app.get("/v1/transactions/history")
def get_transactions():
    return {
        "success": True,
        "data": {
            "transactions": [
                {
                    "id": "tx_001",
                    "type": "receive",
                    "amount": 500,
                    "from": "Demo User",
                    "date": "2025-08-30T10:00:00Z"
                }
            ]
        }
    }

if __name__ == "__main__":
    print("🚀 Starting BiPay Auth API Server...")
    print("📡 Frontend should connect to: http://localhost:8000")
    print("📖 Test endpoints at: http://localhost:8000/v1/auth/test")
    uvicorn.run(app, host="127.0.0.1", port=8000)
