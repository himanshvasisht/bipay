"""
Simple BiPay API Server Test
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="BiPay API Test", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "BiPay API is running!", "status": "success"}

@app.get("/health")
def health():
    return {"status": "healthy", "service": "BiPay"}

@app.get("/test/biometric")
def test_biometric():
    """Test biometric functionality"""
    try:
        from biometric import generate_device_keypair, sign_payload, verify_biometric_signature
        
        # Generate test keypair
        keypair = generate_device_keypair()
        
        # Test payload
        test_payload = {"test": "biometric", "amount": 100}
        
        # Sign and verify
        signature = sign_payload(keypair["private_key"], test_payload)
        is_valid = verify_biometric_signature(keypair["public_key"], test_payload, signature)
        
        return {
            "biometric_test": "success",
            "signature_valid": is_valid,
            "message": "Real biometric signatures working!"
        }
    except Exception as e:
        return {"biometric_test": "failed", "error": str(e)}

@app.get("/test/config")
def test_config():
    """Test configuration"""
    try:
        from config import config
        
        return {
            "config_test": "success",
            "mongo_loaded": config.MONGO_URI != "MISSING",
            "jwt_loaded": config.JWT_SECRET_KEY != "MISSING",
            "message": "Configuration loaded successfully"
        }
    except Exception as e:
        return {"config_test": "failed", "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
