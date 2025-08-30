"""
Comprehensive BiPay System Testing Suite
Tests all components including biometric verification, payments, and security
"""

import asyncio
import json
import time
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from config import config

# Import all modules to test
from biometric import (
    verify_biometric_signature, validate_attestation, verify_timestamp,
    generate_device_keypair, sign_payload, canonical_json
)
from security import create_jwt_token
from fraud_detection import FraudDetectionEngine
from payment_ethics import PaymentEthicsCompliance
from blockchain_audit import BlockchainAuditTrail
from security_audit import SecurityAuditLogger
from notification_service import NotificationService
from session_management import SessionManager, RateLimiter
from ledger_utils import commit_transaction

class BiPayTestSuite:
    """Comprehensive test suite for BiPay system"""
    
    def __init__(self):
        self.db = None
        self.test_results = {
            "passed": 0,
            "failed": 0,
            "tests": []
        }
        
    async def setup(self):
        """Setup test environment"""
        try:
            # Connect to test database
            client = AsyncIOMotorClient(config.MONGO_URI)
            self.db = client.get_default_database()
            
            # Test database connection
            await self.db.command("ping")
            print("✅ Database connection established")
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        if passed:
            self.test_results["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.test_results["failed"] += 1
            print(f"❌ {test_name}: {details}")
        
        self.test_results["tests"].append({
            "name": test_name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.utcnow()
        })
    
    async def test_biometric_system(self):
        """Test biometric signature system"""
        print("\n=== Testing Biometric System ===")
        
        try:
            # Test key generation
            keypair = generate_device_keypair()
            self.log_test("Key generation", True)
            
            # Test payload signing
            test_payload = {
                "action": "test_payment",
                "amount": 1000,
                "timestamp": int(time.time()),
                "nonce": "test_nonce_123"
            }
            
            signature = sign_payload(keypair["private_key"], test_payload)
            self.log_test("Payload signing", True)
            
            # Test signature verification
            is_valid = verify_biometric_signature(
                keypair["public_key"], 
                test_payload, 
                signature
            )
            self.log_test("Signature verification", is_valid, "Valid signature" if is_valid else "Invalid signature")
            
            # Test invalid signature
            invalid_signature = "invalid_signature_base64"
            is_invalid = verify_biometric_signature(
                keypair["public_key"], 
                test_payload, 
                invalid_signature
            )
            self.log_test("Invalid signature rejection", not is_invalid, "Should reject invalid signature")
            
            # Test attestation validation
            valid_attestation = {
                "nonce": "dGVzdF9ub25jZV8xMjM=",  # base64 encoded
                "package_name": "com.bipay.app",
                "apk_digest": "abcd1234567890abcd1234567890abcd12345678",
                "tee_enforced": True,
                "timestamp": int(time.time())
            }
            
            attestation_result = validate_attestation(valid_attestation)
            self.log_test("Attestation validation", attestation_result["valid"], attestation_result["reason"])
            
            # Test timestamp verification
            timestamp_result = verify_timestamp(int(time.time()))
            self.log_test("Timestamp verification", timestamp_result["valid"], timestamp_result["reason"])
            
            # Test old timestamp rejection
            old_timestamp_result = verify_timestamp(int(time.time()) - 600)  # 10 minutes old
            self.log_test("Old timestamp rejection", not old_timestamp_result["valid"], "Should reject old timestamp")
            
        except Exception as e:
            self.log_test("Biometric system", False, str(e))
    
    async def test_security_components(self):
        """Test security audit and session management"""
        print("\n=== Testing Security Components ===")
        
        try:
            test_user_id = "test_user_123"
            test_device_id = "test_device_456"
            
            # Test security audit logging
            await SecurityAuditLogger.log_security_event(
                self.db, "test_event", "low", test_user_id,
                {"test": "data"}, {"ip_address": "127.0.0.1"}
            )
            self.log_test("Security audit logging", True)
            
            # Test session management
            session_result = await SessionManager.create_session(
                self.db, test_user_id, test_device_id, "127.0.0.1", "test-agent"
            )
            self.log_test("Session creation", "session_id" in session_result)
            
            # Test session validation
            if "session_id" in session_result:
                validation_result = await SessionManager.validate_session(
                    self.db, session_result["session_id"], test_user_id, "127.0.0.1"
                )
                self.log_test("Session validation", validation_result["valid"])
            
            # Test rate limiting
            rate_check = await RateLimiter.check_rate_limit(
                self.db, test_user_id, "test_action"
            )
            self.log_test("Rate limiting check", rate_check["allowed"])
            
            # Test rate limit recording
            await RateLimiter.record_attempt(
                self.db, test_user_id, "test_action", "127.0.0.1", True
            )
            self.log_test("Rate limit recording", True)
            
        except Exception as e:
            self.log_test("Security components", False, str(e))
    
    async def test_payment_system(self):
        """Test payment and fraud detection system"""
        print("\n=== Testing Payment System ===")
        
        try:
            test_user_id = "test_user_payment"
            
            # Create test accounts
            await self.db.accounts.insert_one({
                "_id": "test_account_sender",
                "user_id": test_user_id,
                "balance_minor": 10000,  # $100
                "currency": "USD"
            })
            
            await self.db.accounts.insert_one({
                "_id": "test_account_receiver",
                "user_id": "test_user_receiver",
                "balance_minor": 5000,  # $50
                "currency": "USD"
            })
            
            # Create test user
            await self.db.users.insert_one({
                "_id": test_user_id,
                "wallet_id": "test_account_sender",
                "email": "test@bipay.com",
                "kyc": {
                    "full_name": "Test User",
                    "date_of_birth": "1990-01-01",
                    "address": "123 Test St",
                    "phone_verified": True,
                    "email_verified": True,
                    "identity_verified": True,
                    "verified_at": datetime.utcnow()
                }
            })
            
            self.log_test("Test accounts creation", True)
            
            # Test fraud detection
            fraud_analysis = await FraudDetectionEngine.analyze_transaction_patterns(
                self.db, test_user_id, {
                    "from_account": "test_account_sender",
                    "to_account": "test_account_receiver",
                    "amount_minor": 2000
                }
            )
            self.log_test("Fraud detection analysis", "risk_score" in fraud_analysis)
            
            # Test compliance validation
            kyc_check = await PaymentEthicsCompliance.validate_kyc_status(self.db, test_user_id)
            self.log_test("KYC validation", kyc_check["valid"], kyc_check.get("reason", ""))
            
            # Test transaction limits
            from decimal import Decimal
            limits_check = await PaymentEthicsCompliance.validate_transaction_limits(
                self.db, test_user_id, Decimal("20")
            )
            self.log_test("Transaction limits check", limits_check["allowed"])
            
            # Test actual transaction
            transaction_result = await commit_transaction(
                self.db,
                "test_account_sender",
                "test_account_receiver", 
                2000,  # $20
                "USD",
                True,  # biometric verified
                {"test": "payload"},
                test_user_id,
                {"ip_address": "127.0.0.1"}
            )
            
            self.log_test("Transaction processing", "status" in transaction_result and transaction_result["status"] == "success")
            
        except Exception as e:
            self.log_test("Payment system", False, str(e))
    
    async def test_blockchain_audit(self):
        """Test blockchain audit trail"""
        print("\n=== Testing Blockchain Audit ===")
        
        try:
            # Test Merkle root calculation
            test_transactions = [
                {"_id": "tx1", "amount": 1000},
                {"_id": "tx2", "amount": 2000}
            ]
            
            merkle_root = BlockchainAuditTrail.calculate_merkle_root(test_transactions)
            self.log_test("Merkle root calculation", len(merkle_root) == 64)  # SHA-256 hex length
            
            # Test audit block creation
            block_hash = await BlockchainAuditTrail.create_audit_block(self.db, test_transactions)
            self.log_test("Audit block creation", len(block_hash) == 64)
            
            # Test blockchain integrity
            integrity_valid = await BlockchainAuditTrail.verify_chain_integrity(self.db)
            self.log_test("Blockchain integrity", integrity_valid)
            
        except Exception as e:
            self.log_test("Blockchain audit", False, str(e))
    
    async def test_notifications(self):
        """Test notification system"""
        print("\n=== Testing Notifications ===")
        
        try:
            test_user_id = "test_user_notifications"
            
            # Test fraud alert
            await NotificationService.send_fraud_alert(
                self.db, test_user_id,
                {"overall_risk_score": 0.8, "risk_factors": ["high_amount"]},
                {"amount_minor": 5000, "txn_id": "test_tx"}
            )
            self.log_test("Fraud alert notification", True)
            
            # Test transaction notification
            await NotificationService.send_transaction_notification(
                self.db, test_user_id, "p2p",
                {"amount_minor": 1000, "txn_id": "test_tx_success"},
                success=True
            )
            self.log_test("Transaction notification", True)
            
            # Test security notification
            await NotificationService.send_security_notification(
                self.db, test_user_id, "new_device_login",
                {"device_id": "test_device", "ip_address": "127.0.0.1"}
            )
            self.log_test("Security notification", True)
            
        except Exception as e:
            self.log_test("Notifications", False, str(e))
    
    async def test_jwt_system(self):
        """Test JWT token system"""
        print("\n=== Testing JWT System ===")
        
        try:
            # Test JWT creation
            user_data = {
                "user_id": "test_user_jwt",
                "email": "test@bipay.com"
            }
            
            token = create_jwt_token(user_data)
            self.log_test("JWT token creation", len(token) > 100)  # JWT tokens are typically long
            
            # You could add JWT verification test here if needed
            
        except Exception as e:
            self.log_test("JWT system", False, str(e))
    
    async def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting BiPay Comprehensive Test Suite")
        print("=" * 50)
        
        # Setup
        setup_success = await self.setup()
        if not setup_success:
            print("❌ Setup failed, aborting tests")
            return
        
        # Run all test suites
        await self.test_biometric_system()
        await self.test_security_components()
        await self.test_payment_system()
        await self.test_blockchain_audit()
        await self.test_notifications()
        await self.test_jwt_system()
        
        # Cleanup test data
        await self.cleanup()
        
        # Print summary
        print("\n" + "=" * 50)
        print("🏁 Test Suite Complete")
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        total = self.test_results['passed'] + self.test_results['failed']
        success_rate = (self.test_results['passed'] / total * 100) if total > 0 else 0
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if self.test_results['failed'] > 0:
            print("\n❌ Failed Tests:")
            for test in self.test_results['tests']:
                if not test['passed']:
                    print(f"  - {test['name']}: {test['details']}")
        
        return self.test_results
    
    async def cleanup(self):
        """Clean up test data"""
        try:
            # Remove test collections
            test_collections = [
                "test_accounts", "test_users", "test_devices", 
                "test_transactions", "test_notifications"
            ]
            
            # Clean up test data by prefix
            await self.db.accounts.delete_many({"_id": {"$regex": "^test_"}})
            await self.db.users.delete_many({"_id": {"$regex": "^test_"}})
            await self.db.devices.delete_many({"_id": {"$regex": "^test_"}})
            await self.db.transactions.delete_many({"from_account": {"$regex": "^test_"}})
            await self.db.security_logs.delete_many({"user_id": {"$regex": "^test_"}})
            await self.db.notifications.delete_many({"user_id": {"$regex": "^test_"}})
            await self.db.user_sessions.delete_many({"user_id": {"$regex": "^test_"}})
            await self.db.rate_limits.delete_many({"identifier": {"$regex": "^test_"}})
            
            print("🧹 Test data cleanup completed")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")

async def main():
    """Run the test suite"""
    test_suite = BiPayTestSuite()
    results = await test_suite.run_all_tests()
    return results

if __name__ == "__main__":
    asyncio.run(main())
