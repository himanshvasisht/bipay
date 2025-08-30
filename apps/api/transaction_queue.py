"""
Transaction Queue Manager
Handles high-volume transaction processing with retry logic
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from enum import Enum
import uuid

class TransactionStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY = "retry"
    CANCELLED = "cancelled"

class TransactionQueue:
    """High-performance transaction queue with retry logic"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.processing_limit = 100  # Max concurrent transactions
        self.retry_limit = 3
        self.retry_delay = 5  # seconds
    
    async def enqueue_transaction(
        self,
        transaction_data: Dict[str, Any],
        priority: int = 5,
        scheduled_at: Optional[datetime] = None
    ) -> str:
        """Add transaction to processing queue"""
        
        queue_item = {
            "_id": str(uuid.uuid4()),
            "transaction_data": transaction_data,
            "status": TransactionStatus.PENDING.value,
            "priority": priority,  # 1-10, 1 is highest priority
            "created_at": datetime.utcnow(),
            "scheduled_at": scheduled_at or datetime.utcnow(),
            "attempts": 0,
            "last_attempt_at": None,
            "completed_at": None,
            "error_log": []
        }
        
        await self.db.transaction_queue.insert_one(queue_item)
        return queue_item["_id"]
    
    async def process_queue(self):
        """Process pending transactions from queue"""
        
        # Get pending transactions ordered by priority and created_at
        pending_transactions = await self.db.transaction_queue.find({
            "status": {"$in": [TransactionStatus.PENDING.value, TransactionStatus.RETRY.value]},
            "scheduled_at": {"$lte": datetime.utcnow()}
        }).sort([("priority", 1), ("created_at", 1)]).limit(self.processing_limit).to_list(None)
        
        if not pending_transactions:
            return
        
        # Process transactions concurrently
        tasks = []
        for txn in pending_transactions:
            tasks.append(self._process_single_transaction(txn))
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _process_single_transaction(self, queue_item: Dict[str, Any]):
        """Process a single transaction from queue"""
        
        queue_id = queue_item["_id"]
        
        try:
            # Mark as processing
            await self.db.transaction_queue.update_one(
                {"_id": queue_id},
                {
                    "$set": {
                        "status": TransactionStatus.PROCESSING.value,
                        "last_attempt_at": datetime.utcnow()
                    },
                    "$inc": {"attempts": 1}
                }
            )
            
            # Process the transaction
            from ledger_utils import commit_transaction
            transaction_data = queue_item["transaction_data"]
            
            result = await commit_transaction(
                self.db,
                transaction_data["from_account"],
                transaction_data["to_account"],
                transaction_data["amount_minor"],
                transaction_data["currency"],
                transaction_data.get("biometric_verified", False),
                transaction_data.get("hash_payload", {}),
                transaction_data.get("user_id"),
                transaction_data.get("request_metadata", {})
            )
            
            if "error" in result:
                raise Exception(result["error"])
            
            # Mark as completed
            await self.db.transaction_queue.update_one(
                {"_id": queue_id},
                {
                    "$set": {
                        "status": TransactionStatus.COMPLETED.value,
                        "completed_at": datetime.utcnow(),
                        "result": result
                    }
                }
            )
            
        except Exception as e:
            # Handle failure
            await self._handle_transaction_failure(queue_item, str(e))
    
    async def _handle_transaction_failure(self, queue_item: Dict[str, Any], error_message: str):
        """Handle transaction processing failure"""
        
        queue_id = queue_item["_id"]
        attempts = queue_item["attempts"] + 1
        
        # Add error to log
        error_entry = {
            "attempt": attempts,
            "error": error_message,
            "timestamp": datetime.utcnow()
        }
        
        if attempts >= self.retry_limit:
            # Max retries reached, mark as failed
            await self.db.transaction_queue.update_one(
                {"_id": queue_id},
                {
                    "$set": {
                        "status": TransactionStatus.FAILED.value,
                        "completed_at": datetime.utcnow()
                    },
                    "$push": {"error_log": error_entry}
                }
            )
        else:
            # Schedule for retry
            retry_at = datetime.utcnow() + timedelta(seconds=self.retry_delay * attempts)
            
            await self.db.transaction_queue.update_one(
                {"_id": queue_id},
                {
                    "$set": {
                        "status": TransactionStatus.RETRY.value,
                        "scheduled_at": retry_at
                    },
                    "$push": {"error_log": error_entry}
                }
            )
    
    async def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue status"""
        
        status_counts = await self.db.transaction_queue.aggregate([
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]).to_list(None)
        
        status_dict = {status.count: 0 for status in TransactionStatus}
        for item in status_counts:
            if item["_id"] in [status.value for status in TransactionStatus]:
                status_dict[item["_id"]] = item["count"]
        
        # Get oldest pending transaction
        oldest_pending = await self.db.transaction_queue.find_one({
            "status": TransactionStatus.PENDING.value
        }, sort=[("created_at", 1)])
        
        return {
            "status_counts": status_dict,
            "oldest_pending": oldest_pending["created_at"] if oldest_pending else None,
            "processing_limit": self.processing_limit,
            "retry_limit": self.retry_limit
        }
    
    async def cancel_transaction(self, queue_id: str) -> bool:
        """Cancel a pending transaction"""
        
        result = await self.db.transaction_queue.update_one(
            {
                "_id": queue_id,
                "status": {"$in": [TransactionStatus.PENDING.value, TransactionStatus.RETRY.value]}
            },
            {
                "$set": {
                    "status": TransactionStatus.CANCELLED.value,
                    "completed_at": datetime.utcnow()
                }
            }
        )
        
        return result.modified_count > 0
    
    async def get_user_queue_items(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get user's transactions in queue"""
        
        items = await self.db.transaction_queue.find({
            "transaction_data.user_id": user_id
        }).sort("created_at", -1).limit(limit).to_list(None)
        
        return items
    
    async def cleanup_old_completed(self, days_old: int = 7):
        """Clean up old completed/failed transactions"""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        result = await self.db.transaction_queue.delete_many({
            "status": {"$in": [TransactionStatus.COMPLETED.value, TransactionStatus.FAILED.value]},
            "completed_at": {"$lt": cutoff_date}
        })
        
        return result.deleted_count
