from fastapi import APIRouter, HTTPException

router = APIRouter()

from fastapi import Depends, Request, HTTPException
from db import get_db
from security import JWTBearer
from biometric import verify_biometric_signature
from nonce_utils import verify_nonce
from ledger_utils import commit_transaction
from risk_engine import get_risk_score, risk_decision
from notify_utils import notify_user, log_history
from security_audit import SecurityAuditLogger
from fraud_detection import FraudDetectionEngine
from notification_service import NotificationService
from session_management import RateLimiter
from motor.motor_asyncio import AsyncIOMotorDatabase

@router.post("/p2p", dependencies=[Depends(JWTBearer())])
async def p2p_payment(request: Request, to_account: str, amount_minor: int, currency: str, memo: str = ""):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    device_id = request.headers.get("X-Device-Id")
    nonce = request.headers.get("X-Nonce")
    signature = request.headers.get("X-Biometric-Signature")
    
    # Extract user_id from JWT payload
    user_id = user.get("sub") or user.get("user_id") or user.get("id")
    
    # Prepare request metadata for audit logging
    request_metadata = {
        "ip_address": getattr(request.client, "host", None),
        "user_agent": request.headers.get("user-agent"),
        "device_id": device_id,
        "endpoint": "/payments/p2p"
    }
    
    try:
        # Rate limiting check
        rate_check = await RateLimiter.check_rate_limit(
            db, user_id, "payment", request_metadata.get("ip_address")
        )
        if not rate_check["allowed"]:
            await SecurityAuditLogger.log_security_event(
                db, "payment_rate_limited", "medium", user_id,
                {"reason": rate_check["reason"], "attempts": rate_check["attempts"]},
                request_metadata
            )
            raise HTTPException(429, f"Rate limited: {rate_check['reason']}")
        
        # Verify nonce
        if not await verify_nonce(db, nonce, user_id, device_id):
            await RateLimiter.record_attempt(db, user_id, "payment", request_metadata.get("ip_address"), False)
            await SecurityAuditLogger.log_authentication_event(
                db, "nonce_verification_failed", user_id, False,
                {"nonce": nonce, "device_id": device_id}, request_metadata
            )
            raise HTTPException(403, "BIOMETRIC_INVALID: Nonce invalid or used")
        
        # Get device public key
        device = await db.devices.find_one({"user_id": user_id, "_id": device_id})
        if not device:
            await SecurityAuditLogger.log_security_event(
                db, "device_not_found", "high", user_id,
                {"device_id": device_id}, request_metadata
            )
            raise HTTPException(401, "Device not enrolled")
        
        # Get user's wallet
        user_doc = await db.users.find_one({"_id": user_id})
        if not user_doc:
            raise HTTPException(404, "User not found")
        
        payload = {
            "user_id": user_id,
            "device_id": device_id,
            "nonce": nonce,
            "ts": int(request.headers.get("X-Timestamp", "0")),
            "intent": "p2p",
            "amount": amount_minor,
            "currency": currency,
            "to_account": to_account,
            "memo": memo
        }
        
        # Verify biometric signature
        bio_verified = verify_biometric_signature(device["public_key"], payload, signature)
        if not bio_verified:
            await SecurityAuditLogger.log_biometric_event(
                db, "signature_verification_failed", user_id, device_id, False,
                {"signature_provided": bool(signature)}, request_metadata
            )
            raise HTTPException(403, "BIOMETRIC_INVALID: Signature failed")
        
        # Log successful biometric verification
        await SecurityAuditLogger.log_biometric_event(
            db, "signature_verified", user_id, device_id, True,
            {"payment_amount": amount_minor}, request_metadata
        )
        
        # Advanced fraud detection
        fraud_analysis = await FraudDetectionEngine.comprehensive_fraud_check(
            db, user_id, device_id, {
                "from_account": user_doc["wallet_id"],
                "to_account": to_account,
                "amount_minor": amount_minor,
                "currency": currency
            }, request_metadata
        )
        
        # Check fraud detection results
        if fraud_analysis["recommendation"] == "BLOCK":
            await SecurityAuditLogger.log_payment_event(
                db, "payment_blocked_fraud", user_id,
                {
                    "amount": amount_minor,
                    "to_account": to_account,
                    "fraud_score": fraud_analysis["overall_risk_score"],
                    "risk_factors": fraud_analysis["risk_factors"]
                },
                request_metadata
            )
            await NotificationService.send_fraud_alert(
                db, user_id, fraud_analysis, {
                    "amount_minor": amount_minor,
                    "to_account": to_account
                }
            )
            raise HTTPException(403, f"Transaction blocked: High fraud risk - {', '.join(fraud_analysis['risk_factors'])}")
        
        # Risk scoring (legacy system - keeping for compatibility)
        features = {"amount": amount_minor, "user_id": user_id, "device_id": device_id}
        score = get_risk_score(features)
        decision = risk_decision(score)
        
        if decision == "block":
            await SecurityAuditLogger.log_payment_event(
                db, "payment_blocked_risk", user_id,
                {"amount": amount_minor, "to_account": to_account, "risk_score": score},
                request_metadata
            )
            raise HTTPException(403, "RISK_BLOCKED")
        elif decision == "review":
            await SecurityAuditLogger.log_payment_event(
                db, "payment_flagged_review", user_id,
                {"amount": amount_minor, "to_account": to_account, "risk_score": score},
                request_metadata
            )
            raise HTTPException(403, "RISK_REVIEW")
        
        # Commit transaction with enhanced security
        result = await commit_transaction(
            db, user_doc["wallet_id"], to_account, amount_minor, 
            currency, True, payload, user_id, request_metadata
        )
        
        if "error" in result:
            await RateLimiter.record_attempt(db, user_id, "payment", request_metadata.get("ip_address"), False)
            await SecurityAuditLogger.log_payment_event(
                db, "payment_failed", user_id,
                {"amount": amount_minor, "to_account": to_account, "error": result["error"]},
                request_metadata
            )
            await NotificationService.send_transaction_notification(
                db, user_id, "p2p", {
                    "amount_minor": amount_minor,
                    "to_account": to_account,
                    "error": result["error"]
                }, success=False
            )
            raise HTTPException(422, result["error"])
        
        # Log successful payment
        await RateLimiter.record_attempt(db, user_id, "payment", request_metadata.get("ip_address"), True)
        await SecurityAuditLogger.log_payment_event(
            db, "payment_completed", user_id,
            {"amount": amount_minor, "to_account": to_account, "txn_id": result["txn_id"]},
            request_metadata
        )
        
        await notify_user(db, user_id, "Payment sent", f"Sent {amount_minor} {currency} to {to_account}", "payment")
        await log_history(db, user_id, "p2p_payment", result)
        
        # Send success notification
        await NotificationService.send_transaction_notification(
            db, user_id, "p2p", {
                "txn_id": result["txn_id"],
                "amount_minor": amount_minor,
                "to_account": to_account,
                "currency": currency
            }, success=True
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        await SecurityAuditLogger.log_security_event(
            db, "payment_system_error", "critical", user_id,
            {"error": str(e), "amount": amount_minor}, request_metadata
        )
        raise HTTPException(500, "Payment processing error")

@router.post("/merchant", dependencies=[Depends(JWTBearer())])
async def merchant_payment(request: Request, merchant_id: str, amount_minor: int, currency: str, order_id: str = "", memo: str = ""):
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    device_id = request.headers.get("X-Device-Id")
    nonce = request.headers.get("X-Nonce")
    signature = request.headers.get("X-Biometric-Signature")
    # Verify nonce
    if not await verify_nonce(db, nonce, user["sub"], device_id):
        raise HTTPException(403, "BIOMETRIC_INVALID: Nonce invalid or used")
    # Get device public key
    device = await db.devices.find_one({"user_id": user["sub"], "_id": device_id})
    if not device:
        raise HTTPException(401, "Device not enrolled")
    payload = {
        "user_id": user["sub"],
        "device_id": device_id,
        "nonce": nonce,
        "ts": int(request.headers.get("X-Timestamp", "0")),
        "intent": "merchant",
        "amount": amount_minor,
        "currency": currency,
        "merchant_id": merchant_id,
        "order_id": order_id,
        "memo": memo
    }
    if not verify_biometric_signature(device["public_key"], payload, signature):
        raise HTTPException(403, "BIOMETRIC_INVALID: Signature failed")
    # Risk scoring
    features = {"amount": amount_minor, "user_id": user["sub"], "device_id": device_id, "merchant_id": merchant_id}
    score = get_risk_score(features)
    decision = risk_decision(score)
    if decision == "block":
        raise HTTPException(403, "RISK_BLOCKED")
    elif decision == "review":
        # TODO: Add to manual review queue
        raise HTTPException(403, "RISK_REVIEW")
    # Commit transaction
    merchant = await db.merchants.find_one({"_id": merchant_id})
    if not merchant:
        raise HTTPException(404, "Merchant not found")
    result = await commit_transaction(db, user["wallet_id"], merchant["settlement_account"], amount_minor, currency, True, payload)
    if "error" in result:
        raise HTTPException(422, result["error"])
    await notify_user(db, user["sub"], "Merchant payment sent", f"Sent {amount_minor} {currency} to merchant {merchant_id}", "payment")
    await log_history(db, user["sub"], "merchant_payment", result)
    # TODO: Publish webhook event to merchant
    return result
