# BiPay MongoDB Indexes & Migrations

from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def create_indexes():
    client = AsyncIOMotorClient("mongodb://localhost:27017/bipay")
    db = client.get_default_database()
    await db.users.create_index("phone", unique=True)
    await db.users.create_index("email", unique=True)
    await db.devices.create_index("user_id")
    await db.accounts.create_index([("owner_id", 1), ("currency", 1)])
    await db.transactions.create_index([("created_at", -1), ("from_account", 1), ("to_account", 1)])
    await db.ledger_entries.create_index("txn_id")
    await db.nonces.create_index("nonce", unique=True)
    await db.nonces.create_index("expires_at", expireAfterSeconds=0)
    print("Indexes created.")

if __name__ == "__main__":
    asyncio.run(create_indexes())
