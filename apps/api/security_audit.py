import logging
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, Optional
import json

class SecurityAuditLogger:
    """Comprehensive security event logging and monitoring"""
    
    @staticmethod
    async def log_security_event(
        db: AsyncIOMotorDatabase,
        event_type: str,
        severity: str,
        user_id: Optional[str],
        details: Dict[str, Any],
        request_metadata: Optional[Dict[str, Any]] = None
    ):
        """Log security events with comprehensive metadata"""
        
        security_log = {
            "event_type": event_type,
            "severity": severity,  # low, medium, high, critical
            "user_id": user_id,
            "timestamp": datetime.utcnow(),
            "details": details,
            "metadata": {
                "ip_address": request_metadata.get("ip_address") if request_metadata else None,
                "user_agent": request_metadata.get("user_agent") if request_metadata else None,
                "session_id": request_metadata.get("session_id") if request_metadata else None,
                "device_id": request_metadata.get("device_id") if request_metadata else None
            }
        }
        
        # Store in database
        await db.security_logs.insert_one(security_log)
        
        # Log to application logger based on severity
        logger = logging.getLogger("security")
        log_message = f"Security Event: {event_type} - {severity} - User: {user_id}"
        
        if severity == "critical":
            logger.critical(log_message, extra={"event_data": security_log})
        elif severity == "high":
            logger.error(log_message, extra={"event_data": security_log})
        elif severity == "medium":
            logger.warning(log_message, extra={"event_data": security_log})
        else:
            logger.info(log_message, extra={"event_data": security_log})
    
    @staticmethod
    async def log_biometric_event(
        db: AsyncIOMotorDatabase,
        event_type: str,
        user_id: str,
        device_id: str,
        success: bool,
        details: Dict[str, Any],
        request_metadata: Optional[Dict[str, Any]] = None
    ):
        """Log biometric authentication events"""
        
        severity = "low" if success else "high"
        event_details = {
            "device_id": device_id,
            "success": success,
            "biometric_type": details.get("biometric_type", "unknown"),
            "verification_method": details.get("verification_method", "unknown"),
            **details
        }
        
        await SecurityAuditLogger.log_security_event(
            db, f"biometric_{event_type}", severity, user_id, 
            event_details, request_metadata
        )
    
    @staticmethod
    async def log_payment_event(
        db: AsyncIOMotorDatabase,
        event_type: str,
        user_id: str,
        transaction_details: Dict[str, Any],
        request_metadata: Optional[Dict[str, Any]] = None
    ):
        """Log payment-related security events"""
        
        # Determine severity based on event type and amount
        amount = transaction_details.get("amount", 0)
        severity = "medium" if amount > 1000 else "low"
        
        if event_type in ["payment_blocked", "fraud_detected", "aml_alert"]:
            severity = "high"
        
        await SecurityAuditLogger.log_security_event(
            db, f"payment_{event_type}", severity, user_id,
            transaction_details, request_metadata
        )
    
    @staticmethod
    async def log_authentication_event(
        db: AsyncIOMotorDatabase,
        event_type: str,
        user_id: Optional[str],
        success: bool,
        details: Dict[str, Any],
        request_metadata: Optional[Dict[str, Any]] = None
    ):
        """Log authentication events"""
        
        severity = "low" if success else "medium"
        if event_type in ["brute_force_attempt", "account_lockout"]:
            severity = "high"
        
        event_details = {
            "success": success,
            "auth_method": details.get("auth_method", "unknown"),
            **details
        }
        
        await SecurityAuditLogger.log_security_event(
            db, f"auth_{event_type}", severity, user_id,
            event_details, request_metadata
        )
    
    @staticmethod
    async def get_security_summary(
        db: AsyncIOMotorDatabase,
        user_id: Optional[str] = None,
        hours: int = 24
    ) -> Dict[str, Any]:
        """Get security event summary for monitoring"""
        
        from datetime import timedelta
        since = datetime.utcnow() - timedelta(hours=hours)
        
        match_filter = {"timestamp": {"$gte": since}}
        if user_id:
            match_filter["user_id"] = user_id
        
        # Aggregate security events by type and severity
        pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": {
                        "event_type": "$event_type",
                        "severity": "$severity"
                    },
                    "count": {"$sum": 1},
                    "latest": {"$max": "$timestamp"}
                }
            },
            {
                "$group": {
                    "_id": "$_id.severity",
                    "events": {
                        "$push": {
                            "event_type": "$_id.event_type",
                            "count": "$count",
                            "latest": "$latest"
                        }
                    },
                    "total_count": {"$sum": "$count"}
                }
            }
        ]
        
        results = await db.security_logs.aggregate(pipeline).to_list(None)
        
        summary = {
            "period_hours": hours,
            "user_id": user_id,
            "generated_at": datetime.utcnow(),
            "severity_breakdown": {},
            "total_events": 0
        }
        
        for result in results:
            severity = result["_id"]
            summary["severity_breakdown"][severity] = {
                "count": result["total_count"],
                "events": result["events"]
            }
            summary["total_events"] += result["total_count"]
        
        return summary
