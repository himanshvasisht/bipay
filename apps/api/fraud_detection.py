"""
Real-time Fraud Detection Engine
Advanced ML-based fraud detection with pattern recognition
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
import hashlib
import statistics

class FraudDetectionEngine:
    """Advanced fraud detection with behavioral analysis"""
    
    # Risk scoring thresholds
    LOW_RISK_THRESHOLD = 0.3
    MEDIUM_RISK_THRESHOLD = 0.6
    HIGH_RISK_THRESHOLD = 0.8
    
    @staticmethod
    async def analyze_transaction_patterns(
        db: AsyncIOMotorDatabase,
        user_id: str,
        transaction_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze user transaction patterns for anomalies"""
        
        # Get user's recent transaction history
        recent_txns = await db.transactions.find({
            "$or": [
                {"from_account": transaction_data.get("from_account")},
                {"to_account": transaction_data.get("from_account")}
            ],
            "created_at": {"$gte": datetime.utcnow() - timedelta(days=30)},
            "status": "success"
        }).to_list(100)
        
        if len(recent_txns) < 3:
            return {"risk_score": 0.2, "reason": "insufficient_history", "patterns": {}}
        
        # Analyze patterns
        amounts = [txn["amount_minor"] for txn in recent_txns]
        avg_amount = statistics.mean(amounts)
        std_amount = statistics.stdev(amounts) if len(amounts) > 1 else 0
        
        current_amount = transaction_data.get("amount_minor", 0)
        
        # Risk factors
        risk_factors = []
        risk_score = 0.0
        
        # Amount anomaly detection
        if std_amount > 0:
            z_score = abs((current_amount - avg_amount) / std_amount)
            if z_score > 3:  # 3 standard deviations
                risk_factors.append("amount_anomaly")
                risk_score += 0.4
            elif z_score > 2:
                risk_factors.append("amount_unusual")
                risk_score += 0.2
        
        # Large amount check
        if current_amount > avg_amount * 5:
            risk_factors.append("large_amount")
            risk_score += 0.3
        
        # Time pattern analysis
        current_hour = datetime.utcnow().hour
        txn_hours = [txn["created_at"].hour for txn in recent_txns]
        usual_hours = set(txn_hours)
        
        if current_hour not in usual_hours and len(usual_hours) > 3:
            risk_factors.append("unusual_time")
            risk_score += 0.2
        
        # Frequency analysis (velocity check)
        recent_1h = [txn for txn in recent_txns 
                    if txn["created_at"] > datetime.utcnow() - timedelta(hours=1)]
        if len(recent_1h) > 5:
            risk_factors.append("high_frequency")
            risk_score += 0.3
        
        # Recipient analysis
        to_account = transaction_data.get("to_account")
        recipient_history = [txn for txn in recent_txns 
                           if txn.get("to_account") == to_account]
        
        if not recipient_history and current_amount > avg_amount:
            risk_factors.append("new_recipient_large_amount")
            risk_score += 0.25
        
        return {
            "risk_score": min(risk_score, 1.0),
            "risk_factors": risk_factors,
            "patterns": {
                "avg_amount": avg_amount,
                "std_amount": std_amount,
                "usual_hours": list(usual_hours),
                "recent_recipients": len(set(txn.get("to_account") for txn in recent_txns[-10:]))
            }
        }
    
    @staticmethod
    async def check_device_behavior(
        db: AsyncIOMotorDatabase,
        user_id: str,
        device_id: str,
        request_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze device behavior patterns"""
        
        # Get device transaction history
        device_txns = await db.transactions.find({
            "metadata.device_id": device_id,
            "created_at": {"$gte": datetime.utcnow() - timedelta(days=7)},
            "status": "success"
        }).to_list(50)
        
        risk_score = 0.0
        risk_factors = []
        
        # New device check
        if len(device_txns) == 0:
            device_registration = await db.devices.find_one({"_id": device_id})
            if device_registration:
                days_since_registration = (datetime.utcnow() - device_registration["created_at"]).days
                if days_since_registration < 1:
                    risk_factors.append("new_device")
                    risk_score += 0.3
        
        # IP address analysis
        current_ip = request_metadata.get("ip_address")
        if current_ip:
            recent_ips = set()
            for txn in device_txns:
                txn_ip = txn.get("metadata", {}).get("ip_address")
                if txn_ip:
                    recent_ips.add(txn_ip)
            
            if current_ip not in recent_ips and len(recent_ips) > 0:
                risk_factors.append("new_ip_address")
                risk_score += 0.2
        
        # User agent analysis
        current_ua = request_metadata.get("user_agent")
        if current_ua:
            recent_uas = set()
            for txn in device_txns:
                txn_ua = txn.get("metadata", {}).get("user_agent")
                if txn_ua:
                    recent_uas.add(txn_ua)
            
            if current_ua not in recent_uas and len(recent_uas) > 0:
                risk_factors.append("new_user_agent")
                risk_score += 0.15
        
        return {
            "device_risk_score": min(risk_score, 1.0),
            "device_risk_factors": risk_factors,
            "device_history": {
                "total_transactions": len(device_txns),
                "unique_ips": len(set(txn.get("metadata", {}).get("ip_address") 
                                   for txn in device_txns if txn.get("metadata", {}).get("ip_address"))),
                "first_seen": device_txns[-1]["created_at"] if device_txns else None
            }
        }
    
    @staticmethod
    async def network_analysis(
        db: AsyncIOMotorDatabase,
        from_account: str,
        to_account: str
    ) -> Dict[str, Any]:
        """Analyze transaction network for suspicious patterns"""
        
        risk_score = 0.0
        risk_factors = []
        
        # Check for circular transactions
        circular_check = await db.transactions.find({
            "$or": [
                {"from_account": to_account, "to_account": from_account},
                {"from_account": from_account, "to_account": to_account}
            ],
            "created_at": {"$gte": datetime.utcnow() - timedelta(hours=24)}
        }).to_list(10)
        
        if len(circular_check) > 2:
            risk_factors.append("circular_transactions")
            risk_score += 0.4
        
        # Check recipient's recent activity
        recipient_activity = await db.transactions.find({
            "to_account": to_account,
            "created_at": {"$gte": datetime.utcnow() - timedelta(hours=6)}
        }).to_list(20)
        
        if len(recipient_activity) > 15:
            risk_factors.append("high_recipient_activity")
            risk_score += 0.3
        
        # Check for money laundering patterns (structuring)
        sender_recent = await db.transactions.find({
            "from_account": from_account,
            "created_at": {"$gte": datetime.utcnow() - timedelta(hours=24)}
        }).to_list(50)
        
        # Look for amounts just under reporting thresholds
        threshold_amounts = [txn for txn in sender_recent 
                           if 4900 <= txn["amount_minor"] <= 4999]  # Just under $50
        
        if len(threshold_amounts) > 3:
            risk_factors.append("structuring_pattern")
            risk_score += 0.5
        
        return {
            "network_risk_score": min(risk_score, 1.0),
            "network_risk_factors": risk_factors,
            "network_analysis": {
                "circular_transactions": len(circular_check),
                "recipient_recent_activity": len(recipient_activity),
                "threshold_transactions": len(threshold_amounts)
            }
        }
    
    @staticmethod
    async def comprehensive_fraud_check(
        db: AsyncIOMotorDatabase,
        user_id: str,
        device_id: str,
        transaction_data: Dict[str, Any],
        request_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Comprehensive fraud analysis combining all methods"""
        
        # Run all analyses in parallel
        pattern_analysis, device_analysis, network_analysis = await asyncio.gather(
            FraudDetectionEngine.analyze_transaction_patterns(db, user_id, transaction_data),
            FraudDetectionEngine.check_device_behavior(db, user_id, device_id, request_metadata),
            FraudDetectionEngine.network_analysis(
                db, transaction_data.get("from_account"), transaction_data.get("to_account")
            )
        )
        
        # Combine risk scores
        combined_risk_score = (
            pattern_analysis["risk_score"] * 0.4 +
            device_analysis["device_risk_score"] * 0.3 +
            network_analysis["network_risk_score"] * 0.3
        )
        
        # Determine overall risk level
        if combined_risk_score >= FraudDetectionEngine.HIGH_RISK_THRESHOLD:
            risk_level = "HIGH"
            recommendation = "BLOCK"
        elif combined_risk_score >= FraudDetectionEngine.MEDIUM_RISK_THRESHOLD:
            risk_level = "MEDIUM"
            recommendation = "REVIEW"
        elif combined_risk_score >= FraudDetectionEngine.LOW_RISK_THRESHOLD:
            risk_level = "LOW"
            recommendation = "MONITOR"
        else:
            risk_level = "MINIMAL"
            recommendation = "ALLOW"
        
        # Collect all risk factors
        all_risk_factors = (
            pattern_analysis["risk_factors"] +
            device_analysis["device_risk_factors"] +
            network_analysis["network_risk_factors"]
        )
        
        return {
            "overall_risk_score": combined_risk_score,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "risk_factors": all_risk_factors,
            "analysis_breakdown": {
                "pattern_analysis": pattern_analysis,
                "device_analysis": device_analysis,
                "network_analysis": network_analysis
            },
            "timestamp": datetime.utcnow()
        }
