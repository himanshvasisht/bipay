from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from decimal import Decimal
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase

class PaymentEthicsCompliance:
    """Ethical payment compliance and AML/KYC validation"""
    
    # Compliance limits
    DAILY_LIMIT = Decimal("10000.00")  # $10,000 daily limit
    MONTHLY_LIMIT = Decimal("50000.00")  # $50,000 monthly limit
    SUSPICIOUS_AMOUNT = Decimal("5000.00")  # Flag amounts above $5,000
    
    @staticmethod
    async def validate_transaction_limits(
        db: AsyncIOMotorDatabase, 
        user_id: str, 
        amount: Decimal
    ) -> Dict[str, Any]:
        """Validate transaction against compliance limits"""
        
        # Check daily spending
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        daily_spent = await db.ledger_entries.aggregate([
            {
                "$match": {
                    "debit_account": user_id,
                    "created_at": {"$gte": today},
                    "status": "completed"
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"}
                }
            }
        ]).to_list(1)
        
        daily_total = Decimal(str(daily_spent[0]["total"])) if daily_spent else Decimal("0")
        
        # Check monthly spending
        month_start = today.replace(day=1)
        monthly_spent = await db.ledger_entries.aggregate([
            {
                "$match": {
                    "debit_account": user_id,
                    "created_at": {"$gte": month_start},
                    "status": "completed"
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"}
                }
            }
        ]).to_list(1)
        
        monthly_total = Decimal(str(monthly_spent[0]["total"])) if monthly_spent else Decimal("0")
        
        # Validate limits
        if daily_total + amount > PaymentEthicsCompliance.DAILY_LIMIT:
            return {
                "allowed": False,
                "reason": "Daily spending limit exceeded",
                "daily_spent": float(daily_total),
                "daily_limit": float(PaymentEthicsCompliance.DAILY_LIMIT)
            }
        
        if monthly_total + amount > PaymentEthicsCompliance.MONTHLY_LIMIT:
            return {
                "allowed": False,
                "reason": "Monthly spending limit exceeded",
                "monthly_spent": float(monthly_total),
                "monthly_limit": float(PaymentEthicsCompliance.MONTHLY_LIMIT)
            }
        
        # Flag suspicious amounts
        flags = []
        if amount >= PaymentEthicsCompliance.SUSPICIOUS_AMOUNT:
            flags.append("high_amount")
        
        return {
            "allowed": True,
            "daily_spent": float(daily_total),
            "monthly_spent": float(monthly_total),
            "flags": flags
        }
    
    @staticmethod
    async def validate_kyc_status(db: AsyncIOMotorDatabase, user_id: str) -> Dict[str, Any]:
        """Validate user KYC compliance status"""
        user = await db.users.find_one({"_id": user_id})
        
        if not user:
            return {"valid": False, "reason": "User not found"}
        
        kyc_data = user.get("kyc", {})
        
        # Check required KYC fields
        required_fields = ["full_name", "date_of_birth", "address", "phone_verified", "email_verified"]
        missing_fields = [field for field in required_fields if not kyc_data.get(field)]
        
        if missing_fields:
            return {
                "valid": False,
                "reason": "KYC incomplete",
                "missing_fields": missing_fields
            }
        
        # Check verification status
        if not kyc_data.get("identity_verified"):
            return {
                "valid": False,
                "reason": "Identity verification required"
            }
        
        # Check if KYC is expired (annual renewal)
        kyc_date = kyc_data.get("verified_at")
        if kyc_date and (datetime.utcnow() - kyc_date) > timedelta(days=365):
            return {
                "valid": False,
                "reason": "KYC verification expired"
            }
        
        return {"valid": True}
    
    @staticmethod
    async def check_aml_sanctions(db: AsyncIOMotorDatabase, user_id: str) -> Dict[str, Any]:
        """Check user against AML sanctions list"""
        user = await db.users.find_one({"_id": user_id})
        
        if not user:
            return {"clear": False, "reason": "User not found"}
        
        # Check if user is on sanctions list
        sanctions_check = await db.sanctions_list.find_one({
            "$or": [
                {"user_id": user_id},
                {"email": user.get("email")},
                {"phone": user.get("phone")}
            ]
        })
        
        if sanctions_check:
            return {
                "clear": False,
                "reason": "User on sanctions list",
                "sanction_type": sanctions_check.get("type")
            }
        
        return {"clear": True}
    
    @staticmethod
    async def log_compliance_event(
        db: AsyncIOMotorDatabase,
        event_type: str,
        user_id: str,
        details: Dict[str, Any]
    ):
        """Log compliance events for audit"""
        compliance_log = {
            "event_type": event_type,
            "user_id": user_id,
            "timestamp": datetime.utcnow(),
            "details": details,
            "ip_address": details.get("ip_address"),
            "user_agent": details.get("user_agent")
        }
        
        await db.compliance_logs.insert_one(compliance_log)
        
        # Log to application logger
        logging.info(f"Compliance event: {event_type} for user {user_id}")
    
    @staticmethod
    async def validate_consent_management(
        db: AsyncIOMotorDatabase,
        user_id: str,
        consent_type: str
    ) -> bool:
        """Validate user consent for data processing"""
        consent = await db.user_consents.find_one({
            "user_id": user_id,
            "consent_type": consent_type,
            "status": "active"
        })
        
        if not consent:
            return False
        
        # Check if consent is still valid (not expired)
        if consent.get("expires_at") and consent["expires_at"] < datetime.utcnow():
            return False
        
        return True
