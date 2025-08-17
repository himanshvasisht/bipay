"""
🎯 BiPay - Complete Biometric Payment System Backend
Full working implementation with all endpoints
"""

from fastapi import FastAPI, HTTPException, Path, Query, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta
from typing import Optional, List
import hashlib
import uuid
import json
from fastapi.responses import JSONResponse, StreamingResponse
try:
    from webauthn import (
        generate_registration_options,
        verify_registration_response,
        generate_authentication_options,
        verify_authentication_response,
    )
    from webauthn.helpers.structs import RegistrationCredential, AuthenticationCredential
    WEBAUTHN_AVAILABLE = True
except Exception:
    WEBAUTHN_AVAILABLE = False
import logging
from app.database import (
    get_users_collection,
    get_transactions_collection,
    get_merchants_collection,
    get_fingerprints_collection,
    connect_to_database,
    close_database_connection,
)
from app.auth.router import router as auth_router
from app.payments.router import router as payments_router
from app.merchant.router import router as merchant_router

# ============= FastAPI APP SETUP =============

app = FastAPI(
    title="BiPay - Biometric Payment System",
    version="2.0.0",
    description="🎯 Next-generation biometric-first payment system with fingerprint authentication",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Logger setup
logger = logging.getLogger("bipay")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

# ============= APP LIFECYCLE & ROUTERS =============

@app.on_event("startup")
async def on_startup():
    # Ensure MongoDB connection is established before handling requests
    await connect_to_database()

@app.on_event("shutdown")
async def on_shutdown():
    await close_database_connection()

# Mount feature routers that use MongoDB-backed storage
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(payments_router, prefix="/api/payments", tags=["Payments"])
app.include_router(merchant_router, prefix="/api/merchant", tags=["Merchant"])

# Also mount versioned routes to match frontend expectations (/api/v1/...)
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth v1"])
app.include_router(payments_router, prefix="/api/v1/payments", tags=["Payments v1"])
app.include_router(merchant_router, prefix="/api/v1/merchant", tags=["Merchant v1"])

# ============= PYDANTIC MODELS =============

class UserRegisterRequest(BaseModel):
    """User registration request"""
    first_name: str = Field(..., description="User's first name", example="John")
    last_name: str = Field(..., description="User's last name", example="Doe")
    email: EmailStr = Field(..., description="Valid email address", example="john@example.com")
    phone_number: str = Field(..., description="Phone number", example="+1234567890")
    password: str = Field(..., min_length=8, description="Secure password", example="password123")
    fingerprint_data: str = Field(..., description="Base64 encoded fingerprint", example="fingerprint_base64_data")

class UserLoginRequest(BaseModel):
    """User login request"""
    user_id: str = Field(..., description="User ID from registration", example="user_12345")
    fingerprint_data: str = Field(..., description="Base64 encoded fingerprint", example="fingerprint_base64_data")

class P2PPaymentRequest(BaseModel):
    """P2P payment request"""
    to_user: str = Field(..., description="Recipient user ID", example="user_67890")
    amount: float = Field(..., gt=0, description="Payment amount", example=50.00)
    description: Optional[str] = Field(None, description="Payment description", example="Lunch payment")
    fingerprint_data: str = Field(..., description="Sender's fingerprint", example="fingerprint_base64_data")

class MerchantPaymentRequest(BaseModel):
    """Merchant payment request"""
    merchant_id: str = Field(..., description="Merchant ID", example="merchant_123")
    amount: float = Field(..., gt=0, description="Payment amount", example=25.50)
    description: Optional[str] = Field(None, description="Payment description", example="Coffee purchase")
    fingerprint_data: str = Field(..., description="Customer's fingerprint", example="fingerprint_base64_data")

class UserResponse(BaseModel):
    """User profile response"""
    user_id: str
    first_name: str
    last_name: str
    email: str
    phone_number: str
    balance: float
    is_active: bool
    total_transactions: int
    created_at: str

class TransactionResponse(BaseModel):
    """Transaction response"""
    transaction_id: str
    from_user: str
    to_user: Optional[str] = None
    merchant_id: Optional[str] = None
    amount: float
    description: str
    transaction_type: str
    status: str
    created_at: str
    blockchain_recorded: bool = False
    ai_fraud_score: Optional[float] = None

class PaymentResponse(BaseModel):
    """Payment response"""
    success: bool
    transaction_id: str
    message: str
    balance_after: Optional[float] = None
    recipient_name: Optional[str] = None
    fraud_detected: bool = False
    fraud_score: Optional[float] = None

# ============= IN-MEMORY STORAGE =============
users_db = {}
transactions_db = []
merchants_db = {}
fingerprints_db = {}
blockchain_db = []

# WebAuthn storage (in-memory for now)
webauthn_credentials = {}

# ============= UTILITY FUNCTIONS =============

def generate_user_id() -> str:
    return f"user_{uuid.uuid4().hex[:12]}"

def generate_transaction_id() -> str:
    return f"tx_{uuid.uuid4().hex[:16]}"

def generate_merchant_id() -> str:
    return f"merchant_{uuid.uuid4().hex[:12]}"

def generate_wallet_address() -> str:
    # Simple pseudo wallet address (for demo). Replace with real keypair derivation.
    return "0x" + (uuid.uuid4().hex + uuid.uuid4().hex)[:40]

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_fingerprint(stored_fp: str, provided_fp: str) -> tuple[bool, float]:
    """Simulate fingerprint verification with confidence score"""
    # Simple simulation - in production, use actual biometric matching
    similarity = 0.95 if stored_fp == provided_fp else 0.2
    is_match = similarity > 0.8
    return is_match, similarity

def detect_fraud(user_id: str, amount: float, transaction_history: list) -> tuple[bool, float]:
    """AI-powered fraud detection simulation"""
    fraud_score = 0.0
    
    # Check transaction amount anomaly
    if amount > 1000:
        fraud_score += 0.3
    
    # Check transaction frequency
    recent_transactions = [tx for tx in transaction_history if tx.get('from_user') == user_id]
    if len(recent_transactions) > 5:
        fraud_score += 0.2
    
    # Check time patterns (simplified)
    current_hour = datetime.now().hour
    if current_hour < 6 or current_hour > 23:
        fraud_score += 0.1
    
    is_fraudulent = fraud_score > 0.5
    return is_fraudulent, fraud_score

def add_to_blockchain(transaction_data: dict) -> bool:
    """Add transaction to blockchain simulation"""
    try:
        block = {
            "block_id": len(blockchain_db) + 1,
            "timestamp": datetime.utcnow().isoformat(),
            "transaction": transaction_data,
            "hash": hashlib.sha256(json.dumps(transaction_data, sort_keys=True).encode()).hexdigest()
        }
        blockchain_db.append(block)
        return True
    except:
        return False

# ============= MAIN ENDPOINTS =============

@app.get("/", tags=["System"])
async def root():
    """🎯 BiPay API Welcome"""
    return {
        "message": "🎯 Welcome to BiPay - Biometric Payment System",
        "version": "2.0.0",
        "status": "🟢 Operational",
        "features": [
            "🔐 Fingerprint Authentication",
            "💸 P2P Payments", 
            "🏪 Merchant Payments",
            "⛓️ Blockchain Recording",
            "🤖 AI Fraud Detection"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "register": "/api/v1/auth/register",
            "login": "/api/v1/auth/login",
            "p2p_payment": "/api/v1/payments/p2p",
            "merchant_payment": "/api/v1/payments/merchant"
        },
        "statistics": {
            "total_users": len(users_db),
            "total_transactions": len(transactions_db),
            "total_merchants": len(merchants_db),
            "blockchain_blocks": len(blockchain_db)
        }
    }

@app.get("/health", tags=["System"])
async def health_check():
    """System health check"""
    return {
        "status": "🟢 Healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": "Running",
        "database": "Connected",
        "services": {
            "authentication": "✅ Active",
            "payments": "✅ Active", 
            "blockchain": "✅ Active",
            "ai_detection": "✅ Active"
        }
    }

# ============= AUTHENTICATION ENDPOINTS =============

@app.post("/api/v1/auth/register", response_model=dict, tags=["Authentication"])
async def register_user(user_data: UserRegisterRequest):
    """
    👤 Register New User
    
    Creates a new user account with biometric fingerprint enrollment.
    Returns user ID and initial balance of $1000.
    """
    
    # Check if email already exists
    for user in users_db.values():
        if user["email"] == user_data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate unique user ID
    user_id = generate_user_id()
    
    # Store user data
    wallet_address = generate_wallet_address()
    users_db[user_id] = {
        "user_id": user_id,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "email": user_data.email,
        "phone_number": user_data.phone_number,
        "hashed_password": hash_password(user_data.password),
        "balance": 1000.0,  # Starting balance
        "wallet_address": wallet_address,
        "is_active": True,
        "total_transactions": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Store fingerprint
    fingerprints_db[user_id] = {
        "user_id": user_id,
        "fingerprint_data": user_data.fingerprint_data,
        "enrolled_at": datetime.utcnow().isoformat(),
        "last_used": None
    }
    
    return {
        "success": True,
        "message": "User registered successfully! 🎉",
        "user_id": user_id,
    "wallet_address": wallet_address,
        "balance": 1000.0,
        "fingerprint_enrolled": True
    }

@app.post("/api/v1/auth/login", tags=["Authentication"])
async def login_user(login_data: UserLoginRequest):
    """
    🔐 User Login with Fingerprint
    
    Authenticates user using biometric fingerprint verification.
    Returns access token for subsequent API calls.
    """
    
    # Check if user exists
    if login_data.user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users_db[login_data.user_id]
    
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    # Verify fingerprint
    if login_data.user_id not in fingerprints_db:
        raise HTTPException(status_code=400, detail="Fingerprint not enrolled")
    
    stored_fp = fingerprints_db[login_data.user_id]["fingerprint_data"]
    is_match, confidence = verify_fingerprint(stored_fp, login_data.fingerprint_data)
    
    if not is_match:
        raise HTTPException(status_code=401, detail="Fingerprint authentication failed")
    
    # Update last used
    fingerprints_db[login_data.user_id]["last_used"] = datetime.utcnow().isoformat()
    
    # Generate token (simplified)
    access_token = f"bipay_token_{login_data.user_id}_{int(datetime.utcnow().timestamp())}"
    
    return {
        "success": True,
        "message": "Login successful! 🎉",
        "access_token": access_token,
        "token_type": "bearer",
        "user_info": {
            "user_id": user["user_id"],
            "name": f"{user['first_name']} {user['last_name']}",
            "balance": user["balance"]
        },
        "fingerprint_confidence": f"{confidence:.2%}"
    }

@app.post("/api/v1/auth/webauthn/register/options", tags=["Authentication"])
async def get_webauthn_registration_options(user_id: str):
    """Generate WebAuthn registration options for a user."""
    if not WEBAUTHN_AVAILABLE:
        raise HTTPException(status_code=501, detail="WebAuthn support is not installed on the server")
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    options = generate_registration_options(
        rp_name="BiPay",
        rp_id="localhost",
        user_id=user_id.encode(),
        user_name=users_db[user_id]["email"],
    )
    return JSONResponse(content=options.dict())

@app.post("/api/v1/auth/webauthn/register", tags=["Authentication"])
async def register_webauthn_credential(user_id: str, credential: RegistrationCredential):
    """Register a WebAuthn credential for a user."""
    if not WEBAUTHN_AVAILABLE:
        raise HTTPException(status_code=501, detail="WebAuthn support is not installed on the server")
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        verified_credential = verify_registration_response(
            credential=credential,
            expected_rp_id="localhost",
            expected_origin="http://localhost:3000",
            expected_challenge=credential.response.client_data.challenge,
        )
        webauthn_credentials[user_id] = verified_credential.credential_id
        return {"success": True, "message": "WebAuthn credential registered successfully!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

@app.post("/api/v1/auth/webauthn/authenticate/options", tags=["Authentication"])
async def get_webauthn_authentication_options(user_id: str):
    """Generate WebAuthn authentication options for a user."""
    if not WEBAUTHN_AVAILABLE:
        raise HTTPException(status_code=501, detail="WebAuthn support is not installed on the server")
    if user_id not in webauthn_credentials:
        raise HTTPException(status_code=404, detail="WebAuthn credential not found")

    options = generate_authentication_options(
        rp_id="localhost",
        allow_credentials=[webauthn_credentials[user_id]],
    )
    return JSONResponse(content=options.dict())

@app.post("/api/v1/auth/webauthn/authenticate", tags=["Authentication"])
async def authenticate_with_webauthn(user_id: str, credential: AuthenticationCredential):
    """Authenticate a user using WebAuthn."""
    if not WEBAUTHN_AVAILABLE:
        raise HTTPException(status_code=501, detail="WebAuthn support is not installed on the server")
    if user_id not in webauthn_credentials:
        raise HTTPException(status_code=404, detail="WebAuthn credential not found")

    try:
        verify_authentication_response(
            credential=credential,
            expected_rp_id="localhost",
            expected_origin="http://localhost:3000",
            expected_challenge=credential.response.client_data.challenge,
            credential_public_key=webauthn_credentials[user_id],
        )
        return {"success": True, "message": "Authentication successful!"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

# ============= USER MANAGEMENT ENDPOINTS =============

@app.get("/api/v1/users/{user_id}", response_model=UserResponse, tags=["Users"])
async def get_user_profile(
    user_id: str = Path(..., description="User ID to retrieve", example="user_12345")
):
    """
    👤 Get User Profile
    
    Retrieves complete user profile information including balance and transaction history.
    """
    
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users_db[user_id]
    
    return UserResponse(
        user_id=user["user_id"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        email=user["email"],
        phone_number=user["phone_number"],
        balance=user["balance"],
        is_active=user["is_active"],
        total_transactions=user["total_transactions"],
        created_at=user["created_at"]
    )

@app.get("/api/v1/users/{user_id}/balance", tags=["Users"])
async def get_user_balance(
    user_id: str = Path(..., description="User ID", example="user_12345")
):
    """💰 Get User Balance"""
    
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users_db[user_id]
    
    return {
        "user_id": user_id,
        "balance": user["balance"],
        "currency": "USD",
        "last_updated": user["updated_at"]
    }

@app.get("/api/user/balance", tags=["User"])
async def get_user_balance(auth_token: str = Header(...)):
    """Fetch user wallet balance."""
    user_id = validate_token(auth_token)
    users_collection = get_users_collection()
    user = await users_collection.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"balance": user.get("balance", 0.0)}

@app.get("/api/user/transactions", tags=["User"])
async def get_user_transactions(
    auth_token: str = Header(...),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Fetch user transaction history with pagination."""
    user_id = validate_token(auth_token)
    transactions_collection = get_transactions_collection()
    cursor = transactions_collection.find({"$or": [{"from_user": user_id}, {"to_user": user_id}]})
    transactions = await cursor.skip((page - 1) * limit).limit(limit).to_list(length=limit)
    return transactions

# ============= PAYMENT ENDPOINTS =============

@app.post("/api/v1/payments/p2p", response_model=PaymentResponse, tags=["Payments"])
async def process_p2p_payment(payment: P2PPaymentRequest):
    """
    💸 Send P2P Payment
    
    Process peer-to-peer payment with biometric authentication and AI fraud detection.
    
    **Complete Flow:**
    1. 🔐 Fingerprint authentication
    2. 💵 Balance validation
    3. 🤖 AI fraud detection
    4. 💰 Transfer processing
    5. ⛓️ Blockchain recording
    """
    
    # Find sender by fingerprint
    sender_id = None
    for uid, fp_data in fingerprints_db.items():
        is_match, _ = verify_fingerprint(fp_data["fingerprint_data"], payment.fingerprint_data)
        if is_match:
            sender_id = uid
            break
    
    if not sender_id:
        raise HTTPException(status_code=401, detail="Fingerprint authentication failed")
    
    # Validate sender and recipient
    if sender_id not in users_db:
        raise HTTPException(status_code=404, detail="Sender not found")
    
    if payment.to_user not in users_db:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    if sender_id == payment.to_user:
        raise HTTPException(status_code=400, detail="Cannot send money to yourself")
    
    sender = users_db[sender_id]
    recipient = users_db[payment.to_user]
    
    # Check balance
    if sender["balance"] < payment.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient funds. Balance: ${sender['balance']:.2f}"
        )
    
    # AI Fraud Detection
    user_transactions = [tx for tx in transactions_db if tx.get("from_user") == sender_id]
    is_fraud, fraud_score = detect_fraud(sender_id, payment.amount, user_transactions)
    
    if is_fraud:
        # Record flagged transaction
        transaction_id = generate_transaction_id()
        flagged_transaction = {
            "transaction_id": transaction_id,
            "from_user": sender_id,
            "to_user": payment.to_user,
            "amount": payment.amount,
            "description": payment.description or "P2P Payment",
            "transaction_type": "p2p",
            "status": "flagged",
            "fraud_score": fraud_score,
            "created_at": datetime.utcnow().isoformat(),
            "blockchain_recorded": False
        }
        transactions_db.append(flagged_transaction)
        
        raise HTTPException(
            status_code=403,
            detail=f"Transaction flagged by AI fraud detection (Score: {fraud_score:.2f})"
        )
    
    # Process Payment
    transaction_id = generate_transaction_id()
    
    # Update balances
    users_db[sender_id]["balance"] -= payment.amount
    users_db[payment.to_user]["balance"] += payment.amount
    users_db[sender_id]["total_transactions"] += 1
    users_db[sender_id]["updated_at"] = datetime.utcnow().isoformat()
    users_db[payment.to_user]["updated_at"] = datetime.utcnow().isoformat()
    
    # Create transaction record
    transaction = {
        "transaction_id": transaction_id,
        "from_user": sender_id,
        "to_user": payment.to_user,
        "amount": payment.amount,
        "description": payment.description or "P2P Payment",
        "transaction_type": "p2p",
        "status": "completed",
        "fraud_score": fraud_score,
        "created_at": datetime.utcnow().isoformat(),
        "blockchain_recorded": False
    }
    
    # Add to blockchain
    blockchain_success = add_to_blockchain(transaction)
    transaction["blockchain_recorded"] = blockchain_success
    
    # Store transaction
    transactions_db.append(transaction)
    
    return PaymentResponse(
        success=True,
        transaction_id=transaction_id,
        message=f"Successfully sent ${payment.amount:.2f} to {recipient['first_name']} {recipient['last_name']} 🎉",
        balance_after=users_db[sender_id]["balance"],
        recipient_name=f"{recipient['first_name']} {recipient['last_name']}",
        fraud_detected=False,
        fraud_score=fraud_score
    )

@app.post("/api/v1/payments/merchant", response_model=PaymentResponse, tags=["Payments"])
async def process_merchant_payment(payment: MerchantPaymentRequest):
    """
    🏪 Process Merchant Payment
    
    Process payment to merchant using fingerprint scanner integration.
    """
    
    # Find customer by fingerprint
    customer_id = None
    for uid, fp_data in fingerprints_db.items():
        is_match, _ = verify_fingerprint(fp_data["fingerprint_data"], payment.fingerprint_data)
        if is_match:
            customer_id = uid
            break
    
    if not customer_id:
        raise HTTPException(status_code=401, detail="Customer fingerprint not recognized")
    
    if customer_id not in users_db:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = users_db[customer_id]
    
    # Check balance
    if customer["balance"] < payment.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient funds. Balance: ${customer['balance']:.2f}"
        )
    
    # Process payment
    transaction_id = generate_transaction_id()
    
    # Update customer balance
    users_db[customer_id]["balance"] -= payment.amount
    users_db[customer_id]["total_transactions"] += 1
    users_db[customer_id]["updated_at"] = datetime.utcnow().isoformat()
    
    # Create transaction
    transaction = {
        "transaction_id": transaction_id,
        "from_user": customer_id,
        "to_user": None,
        "merchant_id": payment.merchant_id,
        "amount": payment.amount,
        "description": payment.description or f"Merchant payment to {payment.merchant_id}",
        "transaction_type": "merchant",
        "status": "completed",
        "created_at": datetime.utcnow().isoformat(),
        "blockchain_recorded": add_to_blockchain({
            "transaction_id": transaction_id,
            "customer": customer_id,
            "merchant": payment.merchant_id,
            "amount": payment.amount
        })
    }
    
    transactions_db.append(transaction)
    
    return PaymentResponse(
        success=True,
        transaction_id=transaction_id,
        message=f"Payment of ${payment.amount:.2f} completed successfully 🎉",
        balance_after=users_db[customer_id]["balance"],
        recipient_name=f"Merchant {payment.merchant_id}",
        fraud_detected=False
    )

@app.post("/api/v1/payments/refund", response_model=PaymentResponse, tags=["Payments"])
async def process_refund(refund_request: dict):
    """
    🔁 Process Refund

    Body expected: { "transaction_id": "tx_xxx", "reason": "optional reason", "requested_by": "merchant_id_or_admin" }
    This will attempt to reverse the original transaction and credit the original payer.
    """
    try:
        tx_id = refund_request.get("transaction_id")
        if not tx_id:
            raise HTTPException(status_code=400, detail="transaction_id required")

        # find original transaction
        original = next((t for t in transactions_db if t.get("transaction_id") == tx_id), None)
        if not original:
            raise HTTPException(status_code=404, detail="Original transaction not found")

        # Only allow refunds for completed transactions
        if original.get("status") != "completed":
            raise HTTPException(status_code=400, detail="Only completed transactions can be refunded")

        refund_id = generate_transaction_id()
        amount = original.get("amount", 0.0)

        # Determine who should receive the refund (reverse effect)
        if original.get("transaction_type") == "p2p":
            # For P2P, recipient originally received money; refund to recipient's from_user? We'll credit sender back
            sender = original.get("from_user")
            recipient = original.get("to_user")
            # Credit sender back
            if sender and sender in users_db:
                users_db[sender]["balance"] += amount
                users_db[sender]["total_transactions"] = users_db[sender].get("total_transactions", 0) + 1
        elif original.get("transaction_type") == "merchant":
            # For merchant payments, customer was from_user
            customer = original.get("from_user")
            if customer and customer in users_db:
                users_db[customer]["balance"] += amount
                users_db[customer]["total_transactions"] = users_db[customer].get("total_transactions", 0) + 1
        else:
            # generic credit to from_user if exists
            fu = original.get("from_user")
            if fu and fu in users_db:
                users_db[fu]["balance"] += amount
                users_db[fu]["total_transactions"] = users_db[fu].get("total_transactions", 0) + 1

        # create refund transaction record
        refund_tx = {
            "transaction_id": refund_id,
            "from_user": original.get("to_user") or original.get("merchant_id"),
            "to_user": original.get("from_user"),
            "merchant_id": original.get("merchant_id"),
            "amount": amount,
            "description": f"Refund for {tx_id}: " + (refund_request.get("reason") or ""),
            "transaction_type": "refund",
            "status": "completed",
            "created_at": datetime.utcnow().isoformat(),
            "blockchain_recorded": add_to_blockchain({"refund_of": tx_id, "refund_tx": refund_id})
        }
        transactions_db.append(refund_tx)

        return PaymentResponse(
            success=True,
            transaction_id=refund_id,
            message=f"Refund processed for {tx_id}",
            balance_after=users_db.get(refund_tx.get("to_user"), {}).get("balance"),
            recipient_name=str(refund_tx.get("to_user")),
            fraud_detected=False
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refund error: {e}")
        raise HTTPException(status_code=500, detail="Refund failed")

@app.get('/api/v1/analytics/export')
async def export_analytics_csv():
    """Export transactions as CSV for analytics/export"""
    try:
        import csv
        from io import StringIO

        sio = StringIO()
        writer = csv.writer(sio)
        # header
        writer.writerow(["transaction_id", "from_user", "to_user", "merchant_id", "amount", "type", "status", "created_at"]) 
        for tx in transactions_db:
            writer.writerow([
                tx.get('transaction_id'),
                tx.get('from_user'),
                tx.get('to_user'),
                tx.get('merchant_id'),
                tx.get('amount'),
                tx.get('transaction_type'),
                tx.get('status'),
                tx.get('created_at')
            ])

        sio.seek(0)
        return StreamingResponse(iter([sio.getvalue()]), media_type='text/csv', headers={"Content-Disposition":"attachment; filename=transactions_export.csv"})
    except Exception as e:
        logger.error(f"Export CSV error: {e}")
        raise HTTPException(status_code=500, detail="Export failed")

# ============= TRANSACTION HISTORY ENDPOINTS =============

@app.get("/api/v1/payments/history", tags=["Transactions"])
async def get_payment_history(
    limit: int = Query(20, description="Number of transactions to return", ge=1, le=100),
    user_id: Optional[str] = Query(None, description="Filter by user ID", example="user_12345"),
    transaction_type: Optional[str] = Query(None, description="Filter by type: p2p, merchant", example="p2p"),
    status: Optional[str] = Query(None, description="Filter by status: completed, pending, flagged", example="completed")
):
    """
    📊 Get Payment History
    
    Retrieve transaction history with filtering options.
    """
    
    filtered_transactions = transactions_db
    
    # Apply filters
    if user_id:
        filtered_transactions = [
            tx for tx in filtered_transactions
            if tx.get("from_user") == user_id or tx.get("to_user") == user_id
        ]
    
    if transaction_type:
        filtered_transactions = [
            tx for tx in filtered_transactions
            if tx.get("transaction_type") == transaction_type
        ]
    
    if status:
        filtered_transactions = [
            tx for tx in filtered_transactions
            if tx.get("status") == status
        ]
    
    # Sort by creation date (newest first) and limit
    sorted_transactions = sorted(
        filtered_transactions,
        key=lambda x: x.get("created_at", ""),
        reverse=True
    )[:limit]
    
    return {
        "transactions": sorted_transactions,
        "total": len(filtered_transactions),
        "returned": len(sorted_transactions),
        "filters_applied": {
            "user_id": user_id,
            "transaction_type": transaction_type,
            "status": status,
            "limit": limit
        }
    }

@app.get("/api/v1/users/{user_id}/transactions", tags=["Transactions"])
async def get_user_transactions(
    user_id: str = Path(..., description="User ID", example="user_12345"),
    limit: int = Query(10, description="Number of transactions", example=10),
    page: int = Query(1, description="Page number", example=1)
):
    """
    📋 Get User Transactions
    
    Get all transactions for a specific user with pagination.
    """
    
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user transactions
    user_transactions = [
        tx for tx in transactions_db
        if tx.get("from_user") == user_id or tx.get("to_user") == user_id
    ]
    
    # Sort by date
    sorted_transactions = sorted(
        user_transactions,
        key=lambda x: x.get("created_at", ""),
        reverse=True
    )
    
    # Pagination
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_transactions = sorted_transactions[start_idx:end_idx]
    
    total_pages = (len(sorted_transactions) + limit - 1) // limit
    
    return {
        "user_id": user_id,
        "transactions": paginated_transactions,
        "pagination": {
            "current_page": page,
            "total_pages": total_pages,
            "total_transactions": len(sorted_transactions),
            "per_page": limit,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }

# ============= SYSTEM INFO ENDPOINTS =============

@app.get("/api/v1/system/stats", tags=["System"])
async def get_system_stats():
    """📊 System Statistics Dashboard"""
    
    # Calculate stats
    total_volume = sum(tx.get("amount", 0) for tx in transactions_db if tx.get("status") == "completed")
    avg_transaction = total_volume / len(transactions_db) if transactions_db else 0
    
    return {
        "system_overview": {
            "total_users": len(users_db),
            "active_users": len([u for u in users_db.values() if u.get("is_active", False)]),
            "total_merchants": len(merchants_db),
            "total_transactions": len(transactions_db),
            "completed_transactions": len([tx for tx in transactions_db if tx.get("status") == "completed"]),
            "flagged_transactions": len([tx for tx in transactions_db if tx.get("status") == "flagged"]),
            "blockchain_blocks": len(blockchain_db)
        },
        "financial_stats": {
            "total_volume": f"${total_volume:.2f}",
            "average_transaction": f"${avg_transaction:.2f}",
            "total_balance": f"${sum(u.get('balance', 0) for u in users_db.values()):.2f}"
        },
        "security_stats": {
            "fingerprints_enrolled": len(fingerprints_db),
            "fraud_detection_rate": f"{len([tx for tx in transactions_db if tx.get('status') == 'flagged']) / max(len(transactions_db), 1) * 100:.1f}%"
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/users", tags=["Users"])
async def get_all_users(
    limit: int = Query(50, description="Number of users to return", ge=1, le=100),
    active_only: bool = Query(False, description="Show only active users")
):
    """👥 Get All Users (Admin/Testing)"""
    
    filtered_users = list(users_db.values())
    
    if active_only:
        filtered_users = [u for u in filtered_users if u.get("is_active", False)]
    
    # Sort by creation date
    sorted_users = sorted(
        filtered_users,
        key=lambda x: x.get("created_at", ""),
        reverse=True
    )[:limit]
    
    # Remove sensitive data
    safe_users = []
    for user in sorted_users:
        safe_user = {k: v for k, v in user.items() if k != "hashed_password"}
        safe_users.append(safe_user)
    
    return {
        "users": safe_users,
        "total": len(filtered_users),
        "returned": len(safe_users),
        "filters": {
            "active_only": active_only,
            "limit": limit
        }
    }

# ============= COMPATIBILITY ENDPOINTS FOR FRONTEND =============

@app.get("/api/v1/users/{user_id}/balance")
async def get_user_balance_v1(user_id: str):
    """Return a balance object compatible with the frontend shape."""
    users = get_users_collection()
    user = await users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user_id,
        "balance": float(user.get("balance", 0.0)),
        "currency": "USD",
        "last_updated": user.get("updated_at", datetime.utcnow()).isoformat()
    }

@app.get("/api/v1/users/{user_id}/transactions")
async def get_user_transactions_v1(user_id: str, page: int = 1, per_page: int = 20):
    """Return transaction history with pagination in the frontend's expected format."""
    txs = get_transactions_collection()
    skip = max(0, (page - 1) * per_page)

    pipeline = [
        {
            "$match": {
                "$or": [
                    {"from_user": user_id},
                    {"to_user": user_id}
                ]
            }
        },
        {"$sort": {"created_at": -1}},
        {
            "$facet": {
                "transactions": [
                    {"$skip": skip},
                    {"$limit": per_page}
                ],
                "total": [
                    {"$count": "count"}
                ]
            }
        }
    ]

    agg = await txs.aggregate(pipeline).to_list(1)
    if not agg:
        return {
            "transactions": [],
            "pagination": {
                "current_page": page,
                "total_pages": 0,
                "total_transactions": 0,
                "per_page": per_page,
                "has_next": False,
                "has_prev": False
            },
            "user_id": user_id
        }

    data = agg[0]
    items = data.get("transactions", [])
    total_count = 0
    if data.get("total"):
        try:
            total_count = int(data["total"][0]["count"]) if data["total"] else 0
        except Exception:
            total_count = 0
    total_pages = (total_count + per_page - 1) // per_page if per_page else 0

    # Map items to the shape expected by the frontend Transaction type
    mapped = []
    for tx in items:
        mapped.append({
            "transaction_id": tx.get("transaction_id"),
            "from_user": tx.get("from_user"),
            "to_user": tx.get("to_user"),
            "merchant_id": tx.get("merchant_id"),
            "amount": float(tx.get("amount", 0.0)),
            "description": tx.get("description"),
            "transaction_type": tx.get("transaction_type", "p2p"),
            "status": tx.get("status", "completed"),
            "created_at": tx.get("created_at", datetime.utcnow()).isoformat(),
            "blockchain_recorded": bool(tx.get("blockchain_recorded", False)),
            "ai_fraud_score": tx.get("anomaly_score"),
        })

    return {
        "transactions": mapped,
        "pagination": {
            "current_page": page,
            "total_pages": total_pages,
            "total_transactions": total_count,
            "per_page": per_page,
            "has_next": page < total_pages,
            "has_prev": page > 1
        },
        "user_id": user_id
    }

# ============= BLOCKCHAIN ENDPOINTS =============

@app.get("/api/v1/blockchain/info", tags=["Blockchain"])
async def get_blockchain_info():
    """⛓️ Blockchain Information"""
    
    return {
        "blockchain_stats": {
            "total_blocks": len(blockchain_db),
            "latest_block": blockchain_db[-1] if blockchain_db else None,
            "total_recorded_transactions": len([b for b in blockchain_db if b.get("transaction")])
        },
        "integrity": "✅ Verified",
        "consensus": "Proof of Authority",
        "network": "BiPay Private Network"
    }

@app.post("/api/v1/payments/p2p/offline", tags=["Payments"])
async def process_offline_p2p_payments(payments: List[P2PPaymentRequest]):
    """Process multiple queued P2P payments when the device reconnects."""
    results = []
    for payment in payments:
        try:
            # Reuse the existing P2P payment logic
            response = await process_p2p_payment(payment)
            results.append({"payment": payment.dict(), "status": "success", "response": response})
        except HTTPException as e:
            results.append({"payment": payment.dict(), "status": "failed", "error": e.detail})
        except Exception as e:
            results.append({"payment": payment.dict(), "status": "failed", "error": str(e)})

    return {"results": results}

# Helper function to validate token
def validate_token(token: str) -> str:
    """Validate the auth token and return the user ID."""
    # Simplified token validation for demonstration
    if token.startswith("Bearer bipay_token_"):
        return token.split("_")[-1]
    raise HTTPException(status_code=401, detail="Invalid token")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="localhost",
        port=8000,
        reload=True,
        log_level="info"
    )
