"""
Quick BiPay Component Test
"""

import asyncio
import os
import sys

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all modules can be imported"""
    print("🔍 Testing module imports...")
    
    modules_to_test = [
        "config",
        "biometric", 
        "security",
        "fraud_detection",
        "payment_ethics",
        "blockchain_audit",
        "security_audit",
        "notification_service",
        "session_management",
        "ledger_utils"
    ]
    
    import_results = {}
    
    for module_name in modules_to_test:
        try:
            __import__(module_name)
            import_results[module_name] = "✅ SUCCESS"
            print(f"✅ {module_name}")
        except ImportError as e:
            import_results[module_name] = f"❌ FAILED: {e}"
            print(f"❌ {module_name}: {e}")
        except Exception as e:
            import_results[module_name] = f"⚠️  ERROR: {e}"
            print(f"⚠️  {module_name}: {e}")
    
    return import_results

def test_config():
    """Test configuration loading"""
    print("\n🔧 Testing configuration...")
    
    try:
        from config import config
        
        # Test if config loads
        print(f"✅ Config object created")
        
        # Test critical config values
        critical_configs = [
            "MONGO_URI",
            "JWT_SECRET_KEY",
            "JWT_ALGORITHM",
            "JWT_ACCESS_TOKEN_EXPIRE_MINUTES"
        ]
        
        config_status = {}
        for cfg in critical_configs:
            value = getattr(config, cfg, None)
            if value and value != "MISSING":
                config_status[cfg] = "✅ LOADED"
                print(f"✅ {cfg}: Loaded")
            else:
                config_status[cfg] = "❌ MISSING"
                print(f"❌ {cfg}: Missing or 'MISSING'")
        
        return config_status
        
    except Exception as e:
        print(f"❌ Config test failed: {e}")
        return {"error": str(e)}

def test_biometric_basic():
    """Test basic biometric functionality"""
    print("\n🔐 Testing biometric system...")
    
    try:
        from biometric import generate_device_keypair, sign_payload, verify_biometric_signature
        
        # Generate keypair
        keypair = generate_device_keypair()
        print("✅ Keypair generation")
        
        # Test payload
        test_payload = {
            "action": "test",
            "timestamp": 1234567890,
            "amount": 100
        }
        
        # Sign payload
        signature = sign_payload(keypair["private_key"], test_payload)
        print("✅ Payload signing")
        
        # Verify signature
        is_valid = verify_biometric_signature(
            keypair["public_key"], 
            test_payload, 
            signature
        )
        
        if is_valid:
            print("✅ Signature verification")
        else:
            print("❌ Signature verification failed")
        
        return {
            "keypair_generation": True,
            "signing": True,
            "verification": is_valid
        }
        
    except Exception as e:
        print(f"❌ Biometric test failed: {e}")
        return {"error": str(e)}

async def test_database():
    """Test database connection"""
    print("\n🗄️  Testing database connection...")
    
    try:
        from config import config
        from motor.motor_asyncio import AsyncIOMotorClient
        
        # Test connection
        client = AsyncIOMotorClient(config.MONGO_URI)
        db = client.get_default_database()
        
        # Ping database
        result = await db.command("ping")
        
        if result.get("ok") == 1.0:
            print("✅ Database connection successful")
            return {"connection": True}
        else:
            print("❌ Database ping failed")
            return {"connection": False}
            
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return {"error": str(e)}

async def main():
    """Run quick tests"""
    print("🚀 BiPay Quick Component Test")
    print("=" * 40)
    
    # Test imports
    import_results = test_imports()
    
    # Test config
    config_results = test_config()
    
    # Test biometric
    biometric_results = test_biometric_basic()
    
    # Test database
    db_results = await test_database()
    
    # Summary
    print("\n" + "=" * 40)
    print("📊 Test Summary")
    print(f"✅ Successful imports: {sum(1 for v in import_results.values() if 'SUCCESS' in v)}")
    print(f"❌ Failed imports: {sum(1 for v in import_results.values() if 'FAILED' in v)}")
    
    if "error" not in config_results:
        loaded_configs = sum(1 for v in config_results.values() if 'LOADED' in v)
        missing_configs = sum(1 for v in config_results.values() if 'MISSING' in v)
        print(f"✅ Loaded configs: {loaded_configs}")
        print(f"❌ Missing configs: {missing_configs}")
    
    print("\n🎯 Ready for comprehensive testing!" if all(
        "SUCCESS" in str(v) for v in import_results.values()
    ) else "⚠️  Fix import issues before comprehensive testing")

if __name__ == "__main__":
    asyncio.run(main())
