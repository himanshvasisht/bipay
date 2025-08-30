"""
Security and Compliance Admin Router
Provides endpoints for system monitoring, compliance reporting, and security audit
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from db import get_db
from system_integrity import SystemIntegrityMonitor
from security_audit import SecurityAuditLogger
from blockchain_audit import BlockchainAuditTrail
from payment_ethics import PaymentEthicsCompliance
from fraud_detection import FraudDetectionEngine
from transaction_queue import TransactionQueue
from session_management import RateLimiter
from datetime import datetime
from typing import Optional

router = APIRouter()
security = HTTPBearer()

# Admin authentication (simplified for demo)
async def verify_admin_token(token: str = Depends(security)):
    """Verify admin access token (implement proper admin auth in production)"""
    if token.credentials != "admin_demo_token_2024":
        raise HTTPException(status_code=403, detail="Admin access required")
    return token

@router.get("/system/integrity")
async def check_system_integrity(token = Depends(verify_admin_token)):
    """Get comprehensive system integrity report"""
    db: AsyncIOMotorDatabase = get_db()
    
    integrity_report = await SystemIntegrityMonitor.verify_system_integrity(db)
    return integrity_report

@router.get("/compliance/report")
async def generate_compliance_report(token = Depends(verify_admin_token)):
    """Generate compliance report for audit purposes"""
    db: AsyncIOMotorDatabase = get_db()
    
    compliance_report = await SystemIntegrityMonitor.generate_compliance_report(db)
    return compliance_report

@router.get("/security/events")
async def get_security_events(
    user_id: Optional[str] = None,
    hours: int = 24,
    token = Depends(verify_admin_token)
):
    """Get security events summary"""
    db: AsyncIOMotorDatabase = get_db()
    
    security_summary = await SecurityAuditLogger.get_security_summary(db, user_id, hours)
    return security_summary

@router.get("/blockchain/verify")
async def verify_blockchain_integrity(token = Depends(verify_admin_token)):
    """Verify blockchain audit trail integrity"""
    db: AsyncIOMotorDatabase = get_db()
    
    integrity_valid = await BlockchainAuditTrail.verify_chain_integrity(db)
    
    # Get latest block info
    latest_block = await db.audit_blocks.find_one(sort=[("block_number", -1)])
    total_blocks = await db.audit_blocks.count_documents({})
    
    return {
        "blockchain_valid": integrity_valid,
        "total_blocks": total_blocks,
        "latest_block": latest_block["block_number"] if latest_block else 0,
        "latest_block_hash": latest_block["block_hash"] if latest_block else None
    }

@router.get("/compliance/user/{user_id}")
async def check_user_compliance(user_id: str, token = Depends(verify_admin_token)):
    """Check specific user's compliance status"""
    db: AsyncIOMotorDatabase = get_db()
    
    # Check KYC status
    kyc_status = await PaymentEthicsCompliance.validate_kyc_status(db, user_id)
    
    # Check AML status
    aml_status = await PaymentEthicsCompliance.check_aml_sanctions(db, user_id)
    
    # Get spending limits
    from decimal import Decimal
    limits_check = await PaymentEthicsCompliance.validate_transaction_limits(
        db, user_id, Decimal("0")  # Check current spending without adding amount
    )
    
    return {
        "user_id": user_id,
        "kyc_status": kyc_status,
        "aml_status": aml_status,
        "spending_limits": {
            "daily_spent": limits_check.get("daily_spent", 0),
            "monthly_spent": limits_check.get("monthly_spent", 0),
            "daily_limit": 10000.00,
            "monthly_limit": 50000.00
        }
    }

@router.post("/blockchain/audit/batch")
async def create_audit_batch(token = Depends(verify_admin_token)):
    """Manually trigger audit block creation for recent transactions"""
    db: AsyncIOMotorDatabase = get_db()
    
    # Get recent transactions not yet in audit blocks
    from datetime import datetime, timedelta
    recent_cutoff = datetime.utcnow() - timedelta(hours=1)
    
    # Find transactions without audit block hash
    recent_transactions = await db.transactions.find({
        "created_at": {"$gte": recent_cutoff},
        "audit_block_hash": {"$exists": False}
    }).to_list(100)  # Limit to 100 transactions per batch
    
    if not recent_transactions:
        return {"message": "No transactions to audit", "transactions_count": 0}
    
    # Create audit block
    block_hash = await BlockchainAuditTrail.create_audit_block(db, recent_transactions)
    
    # Update transactions with audit block hash
    txn_ids = [tx["_id"] for tx in recent_transactions]
    await db.transactions.update_many(
        {"_id": {"$in": txn_ids}},
        {"$set": {"audit_block_hash": block_hash}}
    )
    
    return {
        "message": "Audit block created",
        "block_hash": block_hash,
        "transactions_count": len(recent_transactions)
    }

@router.get("/system/health")
async def system_health_check():
    """Public health check endpoint (no auth required)"""
    db: AsyncIOMotorDatabase = get_db()
    
    try:
        # Simple database connectivity check
        await db.users.find_one()
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    return {
        "status": "operational" if db_status == "healthy" else "degraded",
        "database": db_status,
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

@router.get("/fraud/analysis/{user_id}")
async def get_fraud_analysis(user_id: str, token = Depends(verify_admin_token)):
    """Get detailed fraud analysis for a user"""
    db: AsyncIOMotorDatabase = get_db()
    
    # Get recent transaction patterns
    fraud_analysis = await FraudDetectionEngine.analyze_transaction_patterns(
        db, user_id, {"amount_minor": 0}  # Dummy transaction for analysis
    )
    
    return {
        "user_id": user_id,
        "fraud_analysis": fraud_analysis,
        "generated_at": datetime.utcnow()
    }

@router.get("/queue/status")
async def get_queue_status(token = Depends(verify_admin_token)):
    """Get transaction queue status"""
    db: AsyncIOMotorDatabase = get_db()
    
    queue = TransactionQueue(db)
    status = await queue.get_queue_status()
    
    return status

@router.get("/rate-limits/{user_id}")
async def get_user_rate_limits(user_id: str, token = Depends(verify_admin_token)):
    """Get rate limit status for a user"""
    db: AsyncIOMotorDatabase = get_db()
    
    rate_status = await RateLimiter.get_rate_limit_status(db, user_id)
    
    return {
        "user_id": user_id,
        "rate_limits": rate_status,
        "checked_at": datetime.utcnow()
    }

@router.post("/rate-limits/{user_id}/reset")
async def reset_user_rate_limits(
    user_id: str, 
    action: str,
    token = Depends(verify_admin_token)
):
    """Reset rate limits for a user"""
    db: AsyncIOMotorDatabase = get_db()
    
    success = await RateLimiter.reset_rate_limit(db, user_id, action)
    
    return {
        "success": success,
        "user_id": user_id,
        "action": action,
        "reset_at": datetime.utcnow()
    }
