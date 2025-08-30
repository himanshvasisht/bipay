import hashlib
import json
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any

class BlockchainAuditTrail:
    """Immutable audit trail for payment transactions"""
    
    @staticmethod
    def calculate_merkle_root(transactions: List[Dict]) -> str:
        """Calculate Merkle root for transaction batch"""
        if not transactions:
            return hashlib.sha256(b"empty").hexdigest()
        
        # Create leaf hashes
        leaves = [hashlib.sha256(json.dumps(tx, sort_keys=True).encode()).hexdigest() 
                 for tx in transactions]
        
        # Build Merkle tree
        while len(leaves) > 1:
            next_level = []
            for i in range(0, len(leaves), 2):
                if i + 1 < len(leaves):
                    combined = leaves[i] + leaves[i + 1]
                else:
                    combined = leaves[i] + leaves[i]  # Duplicate last hash if odd
                next_level.append(hashlib.sha256(combined.encode()).hexdigest())
            leaves = next_level
        
        return leaves[0]
    
    @staticmethod
    async def create_audit_block(db: AsyncIOMotorDatabase, transactions: List[Dict]) -> str:
        """Create immutable audit block with transaction batch"""
        # Get previous block hash
        last_block = await db.audit_blocks.find_one(sort=[("block_number", -1)])
        prev_hash = last_block["block_hash"] if last_block else "genesis"
        block_number = (last_block["block_number"] + 1) if last_block else 0
        
        # Calculate Merkle root
        merkle_root = BlockchainAuditTrail.calculate_merkle_root(transactions)
        
        # Create block
        block = {
            "block_number": block_number,
            "timestamp": datetime.utcnow(),
            "previous_hash": prev_hash,
            "merkle_root": merkle_root,
            "transaction_count": len(transactions),
            "transaction_ids": [tx.get("_id") or tx.get("txn_id") for tx in transactions]
        }
        
        # Calculate block hash
        block_content = json.dumps(block, sort_keys=True, default=str)
        block_hash = hashlib.sha256(block_content.encode()).hexdigest()
        block["block_hash"] = block_hash
        
        # Store immutable block
        await db.audit_blocks.insert_one(block)
        
        return block_hash
    
    @staticmethod
    async def verify_chain_integrity(db: AsyncIOMotorDatabase) -> bool:
        """Verify blockchain integrity"""
        blocks = db.audit_blocks.find().sort("block_number", 1)
        prev_hash = "genesis"
        
        async for block in blocks:
            # Verify previous hash chain
            if block["previous_hash"] != prev_hash:
                return False
            
            # Verify block hash
            temp_block = block.copy()
            stored_hash = temp_block.pop("block_hash")
            calculated_hash = hashlib.sha256(
                json.dumps(temp_block, sort_keys=True, default=str).encode()
            ).hexdigest()
            
            if stored_hash != calculated_hash:
                return False
            
            prev_hash = stored_hash
        
        return True
