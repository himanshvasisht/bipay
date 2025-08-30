from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends
from config import config

# Use configuration instead of direct os.getenv
MONGO_URI = config.MONGO_URI

client = AsyncIOMotorClient(MONGO_URI)
# Explicitly specify database name to avoid configuration error
db = client.bipay  # Use 'bipay' as the database name

def get_db():
    return db
