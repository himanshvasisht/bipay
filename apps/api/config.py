"""
Enhanced environment configuration with proper .env loading
"""

import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(env_path)

class Config:
    """Application configuration"""
    
    # Database
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/bipay")
    
    # JWT Configuration
    JWT_PUBLIC_KEY_PEM = os.getenv("JWT_PUBLIC_KEY_PEM", "")
    JWT_PRIVATE_KEY_PEM = os.getenv("JWT_PRIVATE_KEY_PEM", "")
    JWT_ALGORITHM = "RS256"
    JWT_EXPIRATION_HOURS = 24
    
    # Redis Configuration
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Message Queue Configuration
    KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
    
    # Security Configuration
    WEBHOOK_HMAC_SECRET = os.getenv("WEBHOOK_HMAC_SECRET_DEFAULT", "hackathonsecret")
    
    # External API Keys
    PLAY_INTEGRITY_API_KEY = os.getenv("PLAY_INTEGRITY_API_KEY", "")
    RISK_ENGINE_URL = os.getenv("RISK_ENGINE_URL", "")
    
    # S3 Configuration
    S3_ENDPOINT = os.getenv("S3_ENDPOINT", "")
    S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "")
    S3_BUCKET = os.getenv("S3_BUCKET", "")
    
    # Application Settings
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    @classmethod
    def validate_required_config(cls):
        """Validate that all required configuration is present"""
        required_configs = [
            ("MONGO_URI", cls.MONGO_URI),
            ("JWT_PUBLIC_KEY_PEM", cls.JWT_PUBLIC_KEY_PEM),
            ("JWT_PRIVATE_KEY_PEM", cls.JWT_PRIVATE_KEY_PEM),
        ]
        
        missing_configs = []
        for name, value in required_configs:
            if not value or value.strip() == "":
                missing_configs.append(name)
        
        if missing_configs:
            raise RuntimeError(f"Missing required configuration: {', '.join(missing_configs)}")
        
        return True

# Create global config instance
config = Config()

# Validate configuration on import
try:
    config.validate_required_config()
    print("✅ Configuration validated successfully")
except RuntimeError as e:
    print(f"❌ Configuration error: {e}")
    # Don't raise in production to allow graceful startup
    if config.ENVIRONMENT == "development":
        print("⚠️  Running with incomplete configuration - some features may not work")
