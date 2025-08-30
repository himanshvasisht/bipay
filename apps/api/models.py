from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    id: str = Field(..., alias="_id")
    full_name: str
    phone: str
    email: str
    kyc_status: str
    wallet_id: str
    created_at: datetime

class Device(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    platform: str
    public_key: str
    attestation: dict
    status: str
    created_at: datetime

class Merchant(BaseModel):
    id: str = Field(..., alias="_id")
    display_name: str
    settlement_account: str
    contact: str
    webhook_url: Optional[str]
    api_keys: List[str]
    created_at: datetime

class Account(BaseModel):
    id: str = Field(..., alias="_id")
    owner_type: str
    owner_id: str
    currency: str
    balance_minor: int
    status: str

class Transaction(BaseModel):
    id: str = Field(..., alias="_id")
    type: str
    from_account: str
    to_account: str
    amount_minor: int
    currency: str
    status: str
    biometric_verified: bool
    hash: str
    error_code: Optional[str]
    created_at: datetime

class LedgerEntry(BaseModel):
    id: str = Field(..., alias="_id")
    txn_id: str
    account_id: str
    direction: str
    amount_minor: int
    balance_after: int
    created_at: datetime

class Nonce(BaseModel):
    nonce: str
    user_id: str
    device_id: str
    expires_at: datetime
    used: bool

class Receipt(BaseModel):
    id: str = Field(..., alias="_id")
    txn_id: str
    pdf_url: str
    payload: dict
    created_at: datetime

class Notification(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    type: str
    title: str
    body: str
    read: bool

class Webhook(BaseModel):
    id: str = Field(..., alias="_id")
    merchant_id: str
    event: str
    url: str
    secret: str
    retries: int
