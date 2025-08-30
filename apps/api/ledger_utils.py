import hashlib
import json
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from decimal import Decimal
from blockchain_audit import BlockchainAuditTrail
from payment_ethics import PaymentEthicsCompliance

async def post_ledger_entry(db: AsyncIOMotorDatabase, txn_id: str, account_id: str, direction: str, amount_minor: int, balance_after: int):
    """Post double-entry ledger entry with immutable hash"""
    entry = {
        "txn_id": txn_id,
        "account_id": account_id,
        "direction": direction,
        "amount_minor": amount_minor,
        "balance_after": balance_after,
        "created_at": datetime.utcnow(),
        "status": "completed"
    }
    
    # Create immutable hash for ledger entry
    entry_hash = hashlib.sha256(
        json.dumps(entry, sort_keys=True, default=str).encode()
    ).hexdigest()
    entry["entry_hash"] = entry_hash
    
    await db.ledger_entries.insert_one(entry)

async def commit_transaction(db: AsyncIOMotorDatabase, from_account: str, to_account: str, amount_minor: int, currency: str, biometric_verified: bool, hash_payload: dict, user_id: str = None, request_metadata: dict = None):
    """Commit transaction with enhanced security, compliance, and audit trail"""
    
    # Convert amount for compliance checks
    amount_decimal = Decimal(str(amount_minor)) / 100
    
    # Validate compliance and ethics
    if user_id:
        # Check transaction limits
        limits_check = await PaymentEthicsCompliance.validate_transaction_limits(
            db, user_id, amount_decimal
        )
        if not limits_check["allowed"]:
            metadata = request_metadata or {}
            await PaymentEthicsCompliance.log_compliance_event(
                db, "transaction_blocked", user_id, {
                    "reason": limits_check["reason"],
                    "amount": float(amount_decimal),
                    **metadata
                }
            )
            return {"error": limits_check["reason"], "compliance": limits_check}
        
        # Check KYC status
        kyc_check = await PaymentEthicsCompliance.validate_kyc_status(db, user_id)
        if not kyc_check["valid"]:
            return {"error": "KYC_REQUIRED", "kyc": kyc_check}
        
        # Check AML sanctions
        aml_check = await PaymentEthicsCompliance.check_aml_sanctions(db, user_id)
        if not aml_check["clear"]:
            metadata = request_metadata or {}
            await PaymentEthicsCompliance.log_compliance_event(
                db, "aml_block", user_id, {
                    "reason": aml_check["reason"],
                    "amount": float(amount_decimal),
                    **metadata
                }
            )
            return {"error": "AML_BLOCK", "aml": aml_check}
        
        # Validate data processing consent
        has_consent = await PaymentEthicsCompliance.validate_consent_management(
            db, user_id, "payment_processing"
        )
        if not has_consent:
            return {"error": "CONSENT_REQUIRED"}
    
    async with await db.client.start_session() as s:
        async with s.start_transaction():
            # Debit sender with enhanced validation
            sender = await db.accounts.find_one({"_id": from_account})
            if not sender:
                return {"error": "SENDER_ACCOUNT_NOT_FOUND"}
            
            if sender["balance_minor"] < amount_minor:
                return {"error": "INSUFFICIENT_FUNDS"}
            
            new_sender_balance = sender["balance_minor"] - amount_minor
            await db.accounts.update_one(
                {"_id": from_account}, 
                {"$set": {"balance_minor": new_sender_balance, "last_updated": datetime.utcnow()}}
            )
            
            # Credit receiver with validation
            receiver = await db.accounts.find_one({"_id": to_account})
            if not receiver:
                return {"error": "RECEIVER_ACCOUNT_NOT_FOUND"}
            
            new_receiver_balance = receiver["balance_minor"] + amount_minor
            await db.accounts.update_one(
                {"_id": to_account}, 
                {"$set": {"balance_minor": new_receiver_balance, "last_updated": datetime.utcnow()}}
            )
            
            # Create enhanced transaction record
            txn_doc = {
                "type": "p2p",
                "from_account": from_account,
                "to_account": to_account,
                "amount_minor": amount_minor,
                "currency": currency,
                "status": "success",
                "biometric_verified": biometric_verified,
                "created_at": datetime.utcnow(),
                "compliance_checks": {
                    "kyc_verified": True,
                    "aml_clear": True,
                    "limits_validated": True
                },
                "metadata": request_metadata or {}
            }
            
            txn_result = await db.transactions.insert_one(txn_doc)
            txn_id = txn_result.inserted_id
            
            # Post ledger entries with immutable hashes
            await post_ledger_entry(db, str(txn_id), from_account, "debit", amount_minor, new_sender_balance)
            await post_ledger_entry(db, str(txn_id), to_account, "credit", amount_minor, new_receiver_balance)
            
            # Create immutable transaction hash
            hash_data = {
                "txn_id": str(txn_id),
                "from_account": from_account,
                "to_account": to_account,
                "amount_minor": amount_minor,
                "currency": currency,
                "timestamp": txn_doc["created_at"].isoformat(),
                "sender_balance_after": new_sender_balance,
                "receiver_balance_after": new_receiver_balance,
                "biometric_verified": biometric_verified
            }
            
            txn_hash = hashlib.sha256(
                json.dumps(hash_data, sort_keys=True).encode()
            ).hexdigest()
            
            await db.transactions.update_one(
                {"_id": txn_id}, 
                {"$set": {"hash": txn_hash, "hash_data": hash_data}}
            )
            
            # Add to blockchain audit trail
            try:
                audit_transactions = [{"_id": str(txn_id), **txn_doc, "hash": txn_hash}]
                block_hash = await BlockchainAuditTrail.create_audit_block(db, audit_transactions)
                
                await db.transactions.update_one(
                    {"_id": txn_id},
                    {"$set": {"audit_block_hash": block_hash}}
                )
            except Exception as e:
                # Log audit trail error but don't fail transaction
                print(f"Audit trail error: {e}")
            
            # Log compliance event
            if user_id:
                metadata = request_metadata or {}
                await PaymentEthicsCompliance.log_compliance_event(
                    db, "transaction_completed", user_id, {
                        "txn_id": str(txn_id),
                        "amount": float(amount_decimal),
                        "hash": txn_hash,
                        **metadata
                    }
                )
            
            return {
                "status": "success",
                "txn_id": str(txn_id),
                "hash": txn_hash,
                "audit_block_hash": block_hash if 'block_hash' in locals() else None,
                "sender_balance": new_sender_balance,
                "receiver_balance": new_receiver_balance
            }
