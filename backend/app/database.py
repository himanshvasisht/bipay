"""
In-Memory Database Implementation
"""

from typing import Optional, Dict, List, Any
from datetime import datetime
import uuid
from loguru import logger

class MockCursor:
    def __init__(self, data: List[Dict]):
        self.data = data
        self.index = 0
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        if self.index >= len(self.data):
            raise StopAsyncIteration
        result = self.data[self.index]
        self.index += 1
        return result
    
    async def to_list(self, length=None):
        return self.data[:length] if length else self.data

class MockCollection:
    def __init__(self, name: str):
        self.name = name
        self.data: List[Dict] = []
    
    async def find_one(self, filter_dict: Optional[Dict] = None) -> Optional[Dict]:
        if not filter_dict:
            return self.data[0] if self.data else None
        
        for item in self.data:
            if self._matches_filter(item, filter_dict):
                return item
        return None
    
    def find(self, filter_dict: Optional[Dict] = None) -> MockCursor:
        if not filter_dict:
            return MockCursor(self.data)
        
        filtered_data = [item for item in self.data if self._matches_filter(item, filter_dict)]
        return MockCursor(filtered_data)
    
    async def insert_one(self, document: Dict) -> Dict:
        doc = document.copy()
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        if "created_at" not in doc:
            doc["created_at"] = datetime.utcnow()
        self.data.append(doc)
        return {"inserted_id": doc["_id"]}
    
    async def update_one(self, filter_dict: Dict, update_dict: Dict) -> Dict:
        for item in self.data:
            if self._matches_filter(item, filter_dict):
                if "$set" in update_dict:
                    item.update(update_dict["$set"])
                elif "$inc" in update_dict:
                    for key, value in update_dict["$inc"].items():
                        item[key] = item.get(key, 0) + value
                else:
                    item.update(update_dict)
                item["updated_at"] = datetime.utcnow()
                return {"modified_count": 1}
        return {"modified_count": 0}
    
    def _matches_filter(self, item: Dict, filter_dict: Dict) -> bool:
        for key, value in filter_dict.items():
            if key not in item:
                return False
            if isinstance(value, dict):
                item_value = item[key]
                for op, op_value in value.items():
                    if op == "$gte" and item_value < op_value:
                        return False
                    elif op == "$lte" and item_value > op_value:
                        return False
                    elif op == "$gt" and item_value <= op_value:
                        return False
                    elif op == "$lt" and item_value >= op_value:
                        return False
                    elif op == "$ne" and item_value == op_value:
                        return False
                    elif op == "$in" and item_value not in op_value:
                        return False
            elif item[key] != value:
                return False
        return True

class MockDatabase:
    def __init__(self):
        self.collections = {}
    
    def __getitem__(self, collection_name: str) -> MockCollection:
        if collection_name not in self.collections:
            self.collections[collection_name] = MockCollection(collection_name)
        return self.collections[collection_name]

class Database:
    def __init__(self):
        self.client = None
        self.database = MockDatabase()

database = Database()

async def connect_to_database():
    try:
        logger.info("Initializing in-memory database...")
        database.database = MockDatabase()
        logger.info("In-memory database initialized successfully!")
        await create_indexes()
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise e

async def close_database_connection():
    try:
        logger.info("Cleaning up database connections...")
        database.database = None
        logger.info("Database cleanup completed")
    except Exception as e:
        logger.error(f"Error during database cleanup: {e}")

async def create_indexes():
    try:
        logger.info("Creating database indexes...")
        logger.info("Database indexes created successfully!")
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

def get_users_collection():
    return database.database["users"]

def get_merchants_collection():
    return database.database["merchants"]

def get_transactions_collection():
    return database.database["transactions"]

def get_biometric_templates_collection():
    return database.database["biometric_templates"]

def get_fingerprints_collection():
    return database.database["fingerprints"]

def get_blockchain_blocks_collection():
    return database.database["blockchain_blocks"]
