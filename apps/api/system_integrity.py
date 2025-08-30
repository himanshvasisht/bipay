from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import Dict, Any
import asyncio
from blockchain_audit import BlockchainAuditTrail
from security_audit import SecurityAuditLogger

class SystemIntegrityMonitor:
    """Monitor system integrity and blockchain consistency"""
    
    @staticmethod
    async def verify_system_integrity(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
        """Comprehensive system integrity check"""
        
        integrity_report = {
            "timestamp": datetime.utcnow(),
            "blockchain_integrity": False,
            "ledger_consistency": False,
            "security_status": "unknown",
            "issues": [],
            "recommendations": []
        }
        
        try:
            # Check blockchain integrity
            blockchain_valid = await BlockchainAuditTrail.verify_chain_integrity(db)
            integrity_report["blockchain_integrity"] = blockchain_valid
            
            if not blockchain_valid:
                integrity_report["issues"].append("Blockchain integrity compromised")
                integrity_report["recommendations"].append("Investigate blockchain tampering")
            
            # Verify ledger consistency
            ledger_consistent = await SystemIntegrityMonitor._verify_ledger_consistency(db)
            integrity_report["ledger_consistency"] = ledger_consistent
            
            if not ledger_consistent:
                integrity_report["issues"].append("Ledger entries inconsistent")
                integrity_report["recommendations"].append("Audit double-entry ledger")
            
            # Check recent security events
            security_summary = await SecurityAuditLogger.get_security_summary(db, hours=24)
            high_severity_events = security_summary["severity_breakdown"].get("high", {}).get("count", 0)
            critical_events = security_summary["severity_breakdown"].get("critical", {}).get("count", 0)
            
            if critical_events > 0:
                integrity_report["security_status"] = "critical"
                integrity_report["issues"].append(f"{critical_events} critical security events in last 24h")
                integrity_report["recommendations"].append("Immediate security investigation required")
            elif high_severity_events > 10:
                integrity_report["security_status"] = "warning"
                integrity_report["issues"].append(f"{high_severity_events} high severity events in last 24h")
                integrity_report["recommendations"].append("Review security events")
            else:
                integrity_report["security_status"] = "normal"
            
            # Overall system status
            integrity_report["overall_status"] = "healthy" if (
                blockchain_valid and ledger_consistent and 
                integrity_report["security_status"] in ["normal", "warning"]
            ) else "compromised"
            
        except Exception as e:
            integrity_report["issues"].append(f"Integrity check failed: {str(e)}")
            integrity_report["overall_status"] = "error"
        
        return integrity_report
    
    @staticmethod
    async def _verify_ledger_consistency(db: AsyncIOMotorDatabase) -> bool:
        """Verify double-entry ledger consistency"""
        
        try:
            # Check that all transactions have matching debit/credit entries
            pipeline = [
                {
                    "$group": {
                        "_id": "$txn_id",
                        "total_debits": {
                            "$sum": {
                                "$cond": [{"$eq": ["$direction", "debit"]}, "$amount_minor", 0]
                            }
                        },
                        "total_credits": {
                            "$sum": {
                                "$cond": [{"$eq": ["$direction", "credit"]}, "$amount_minor", 0]
                            }
                        },
                        "count": {"$sum": 1}
                    }
                },
                {
                    "$match": {
                        "$expr": {"$ne": ["$total_debits", "$total_credits"]}
                    }
                }
            ]
            
            inconsistent = await db.ledger_entries.aggregate(pipeline).to_list(None)
            
            if inconsistent:
                return False
            
            # Verify account balances match ledger entries
            accounts = db.accounts.find({})
            async for account in accounts:
                # Calculate balance from ledger entries
                ledger_balance = await db.ledger_entries.aggregate([
                    {"$match": {"account_id": account["_id"]}},
                    {
                        "$group": {
                            "_id": None,
                            "total": {
                                "$sum": {
                                    "$cond": [
                                        {"$eq": ["$direction", "credit"]},
                                        "$amount_minor",
                                        {"$multiply": ["$amount_minor", -1]}
                                    ]
                                }
                            }
                        }
                    }
                ]).to_list(1)
                
                calculated_balance = ledger_balance[0]["total"] if ledger_balance else 0
                
                if calculated_balance != account["balance_minor"]:
                    return False
            
            return True
            
        except Exception:
            return False
    
    @staticmethod
    async def generate_compliance_report(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
        """Generate comprehensive compliance report"""
        
        report = {
            "generated_at": datetime.utcnow(),
            "period": "last_30_days",
            "biometric_compliance": {},
            "payment_compliance": {},
            "audit_trail_status": {},
            "recommendations": []
        }
        
        try:
            # Biometric compliance metrics
            total_bio_events = await db.security_logs.count_documents({
                "event_type": {"$regex": "^biometric_"},
                "timestamp": {"$gte": datetime.utcnow().replace(day=1)}
            })
            
            failed_bio_events = await db.security_logs.count_documents({
                "event_type": "biometric_signature_verification_failed",
                "timestamp": {"$gte": datetime.utcnow().replace(day=1)}
            })
            
            bio_success_rate = ((total_bio_events - failed_bio_events) / total_bio_events * 100) if total_bio_events > 0 else 0
            
            report["biometric_compliance"] = {
                "total_events": total_bio_events,
                "failed_events": failed_bio_events,
                "success_rate_percent": round(bio_success_rate, 2),
                "status": "compliant" if bio_success_rate >= 95 else "non_compliant"
            }
            
            # Payment compliance metrics
            total_payments = await db.transactions.count_documents({
                "created_at": {"$gte": datetime.utcnow().replace(day=1)}
            })
            
            blocked_payments = await db.security_logs.count_documents({
                "event_type": {"$in": ["payment_blocked_risk", "payment_blocked"]},
                "timestamp": {"$gte": datetime.utcnow().replace(day=1)}
            })
            
            report["payment_compliance"] = {
                "total_payments": total_payments,
                "blocked_payments": blocked_payments,
                "block_rate_percent": round((blocked_payments / total_payments * 100) if total_payments > 0 else 0, 2)
            }
            
            # Audit trail status
            latest_block = await db.audit_blocks.find_one(sort=[("block_number", -1)])
            total_blocks = await db.audit_blocks.count_documents({})
            
            report["audit_trail_status"] = {
                "total_blocks": total_blocks,
                "latest_block_number": latest_block["block_number"] if latest_block else 0,
                "blockchain_verified": await BlockchainAuditTrail.verify_chain_integrity(db)
            }
            
            # Generate recommendations
            if bio_success_rate < 95:
                report["recommendations"].append("Investigate biometric authentication failures")
            
            if not report["audit_trail_status"]["blockchain_verified"]:
                report["recommendations"].append("Critical: Blockchain integrity compromised")
            
            if blocked_payments / total_payments > 0.1 if total_payments > 0 else False:
                report["recommendations"].append("High payment block rate - review risk parameters")
            
        except Exception as e:
            report["error"] = str(e)
        
        return report
