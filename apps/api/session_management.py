"""
Session Management & Rate Limiting
Advanced session handling with rate limiting and abuse prevention
"""

import asyncio
import hashlib
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase
import time

class SessionManager:
    """Advanced session management with security features"""
    
    # Session configuration
    SESSION_TIMEOUT = 30  # minutes
    MAX_SESSIONS_PER_USER = 5
    SESSION_REFRESH_THRESHOLD = 5  # minutes before expiry
    
    @staticmethod
    async def create_session(
        db: AsyncIOMotorDatabase,
        user_id: str,
        device_id: str,
        ip_address: str,
        user_agent: str
    ) -> Dict[str, Any]:
        """Create new user session"""
        
        # Check for existing sessions
        existing_sessions = await db.user_sessions.count_documents({
            "user_id": user_id,
            "status": "active",
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        # Cleanup old sessions if limit exceeded
        if existing_sessions >= SessionManager.MAX_SESSIONS_PER_USER:
            await SessionManager._cleanup_old_sessions(db, user_id)
        
        # Create session
        session_id = hashlib.sha256(f"{user_id}{device_id}{time.time()}".encode()).hexdigest()
        expires_at = datetime.utcnow() + timedelta(minutes=SessionManager.SESSION_TIMEOUT)
        
        session_data = {
            "_id": session_id,
            "user_id": user_id,
            "device_id": device_id,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "expires_at": expires_at,
            "status": "active",
            "activity_count": 1
        }
        
        await db.user_sessions.insert_one(session_data)
        
        return {
            "session_id": session_id,
            "expires_at": expires_at,
            "timeout_minutes": SessionManager.SESSION_TIMEOUT
        }
    
    @staticmethod
    async def validate_session(
        db: AsyncIOMotorDatabase,
        session_id: str,
        user_id: str,
        ip_address: str
    ) -> Dict[str, Any]:
        """Validate and update session"""
        
        session = await db.user_sessions.find_one({
            "_id": session_id,
            "user_id": user_id,
            "status": "active"
        })
        
        if not session:
            return {"valid": False, "reason": "session_not_found"}
        
        # Check expiration
        if session["expires_at"] < datetime.utcnow():
            await db.user_sessions.update_one(
                {"_id": session_id},
                {"$set": {"status": "expired"}}
            )
            return {"valid": False, "reason": "session_expired"}
        
        # Check IP address (optional security check)
        if session["ip_address"] != ip_address:
            # Log potential session hijacking
            await SessionManager._log_security_event(
                db, user_id, "ip_mismatch", {
                    "session_ip": session["ip_address"],
                    "request_ip": ip_address,
                    "session_id": session_id
                }
            )
        
        # Update last activity
        await db.user_sessions.update_one(
            {"_id": session_id},
            {
                "$set": {"last_activity": datetime.utcnow()},
                "$inc": {"activity_count": 1}
            }
        )
        
        # Check if session needs refresh
        time_until_expiry = session["expires_at"] - datetime.utcnow()
        needs_refresh = time_until_expiry < timedelta(minutes=SessionManager.SESSION_REFRESH_THRESHOLD)
        
        return {
            "valid": True,
            "session": session,
            "needs_refresh": needs_refresh
        }
    
    @staticmethod
    async def refresh_session(
        db: AsyncIOMotorDatabase,
        session_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Refresh session expiration"""
        
        new_expires_at = datetime.utcnow() + timedelta(minutes=SessionManager.SESSION_TIMEOUT)
        
        result = await db.user_sessions.update_one(
            {"_id": session_id, "user_id": user_id, "status": "active"},
            {"$set": {"expires_at": new_expires_at}}
        )
        
        if result.modified_count > 0:
            return {"refreshed": True, "expires_at": new_expires_at}
        
        return {"refreshed": False, "reason": "session_not_found"}
    
    @staticmethod
    async def invalidate_session(
        db: AsyncIOMotorDatabase,
        session_id: str,
        user_id: str
    ) -> bool:
        """Invalidate specific session"""
        
        result = await db.user_sessions.update_one(
            {"_id": session_id, "user_id": user_id},
            {"$set": {"status": "invalidated", "invalidated_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0
    
    @staticmethod
    async def invalidate_all_sessions(
        db: AsyncIOMotorDatabase,
        user_id: str,
        except_session: Optional[str] = None
    ) -> int:
        """Invalidate all user sessions except specified one"""
        
        query = {"user_id": user_id, "status": "active"}
        if except_session:
            query["_id"] = {"$ne": except_session}
        
        result = await db.user_sessions.update_many(
            query,
            {"$set": {"status": "invalidated", "invalidated_at": datetime.utcnow()}}
        )
        
        return result.modified_count
    
    @staticmethod
    async def _cleanup_old_sessions(
        db: AsyncIOMotorDatabase,
        user_id: str
    ):
        """Remove oldest sessions when limit exceeded"""
        
        # Get oldest active session
        oldest_session = await db.user_sessions.find_one(
            {"user_id": user_id, "status": "active"},
            sort=[("last_activity", 1)]
        )
        
        if oldest_session:
            await db.user_sessions.update_one(
                {"_id": oldest_session["_id"]},
                {"$set": {"status": "replaced", "replaced_at": datetime.utcnow()}}
            )
    
    @staticmethod
    async def _log_security_event(
        db: AsyncIOMotorDatabase,
        user_id: str,
        event_type: str,
        details: Dict[str, Any]
    ):
        """Log security events for sessions"""
        
        security_event = {
            "user_id": user_id,
            "event_type": f"session_{event_type}",
            "severity": "medium",
            "details": details,
            "timestamp": datetime.utcnow()
        }
        
        await db.security_logs.insert_one(security_event)

class RateLimiter:
    """Advanced rate limiting with multiple strategies"""
    
    # Rate limit configurations
    LIMITS = {
        "login": {"window": 300, "max_attempts": 5},  # 5 attempts per 5 minutes
        "biometric": {"window": 60, "max_attempts": 3},  # 3 attempts per minute
        "payment": {"window": 60, "max_attempts": 10},  # 10 payments per minute
        "api_general": {"window": 60, "max_attempts": 100},  # 100 requests per minute
        "password_reset": {"window": 3600, "max_attempts": 3}  # 3 resets per hour
    }
    
    @staticmethod
    async def check_rate_limit(
        db: AsyncIOMotorDatabase,
        identifier: str,
        action: str,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Check if action is rate limited"""
        
        if action not in RateLimiter.LIMITS:
            return {"allowed": True, "reason": "no_limit_configured"}
        
        limit_config = RateLimiter.LIMITS[action]
        window_start = datetime.utcnow() - timedelta(seconds=limit_config["window"])
        
        # Count recent attempts
        query = {
            "identifier": identifier,
            "action": action,
            "timestamp": {"$gte": window_start}
        }
        
        if ip_address:
            # Also check IP-based limits
            ip_query = {
                "ip_address": ip_address,
                "action": action,
                "timestamp": {"$gte": window_start}
            }
            
            ip_count = await db.rate_limits.count_documents(ip_query)
            if ip_count >= limit_config["max_attempts"]:
                return {
                    "allowed": False,
                    "reason": "ip_rate_limited",
                    "reset_at": window_start + timedelta(seconds=limit_config["window"]),
                    "attempts": ip_count,
                    "max_attempts": limit_config["max_attempts"]
                }
        
        attempt_count = await db.rate_limits.count_documents(query)
        
        if attempt_count >= limit_config["max_attempts"]:
            return {
                "allowed": False,
                "reason": "rate_limited",
                "reset_at": window_start + timedelta(seconds=limit_config["window"]),
                "attempts": attempt_count,
                "max_attempts": limit_config["max_attempts"]
            }
        
        return {
            "allowed": True,
            "attempts": attempt_count,
            "max_attempts": limit_config["max_attempts"],
            "remaining": limit_config["max_attempts"] - attempt_count
        }
    
    @staticmethod
    async def record_attempt(
        db: AsyncIOMotorDatabase,
        identifier: str,
        action: str,
        ip_address: Optional[str] = None,
        success: bool = True,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Record an attempt for rate limiting"""
        
        attempt_record = {
            "identifier": identifier,
            "action": action,
            "ip_address": ip_address,
            "success": success,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow()
        }
        
        await db.rate_limits.insert_one(attempt_record)
        
        # Clean up old records periodically
        if action in RateLimiter.LIMITS:
            cleanup_before = datetime.utcnow() - timedelta(
                seconds=RateLimiter.LIMITS[action]["window"] * 2
            )
            
            await db.rate_limits.delete_many({
                "action": action,
                "timestamp": {"$lt": cleanup_before}
            })
    
    @staticmethod
    async def get_rate_limit_status(
        db: AsyncIOMotorDatabase,
        identifier: str
    ) -> Dict[str, Any]:
        """Get rate limit status for all actions"""
        
        status = {}
        
        for action, config in RateLimiter.LIMITS.items():
            window_start = datetime.utcnow() - timedelta(seconds=config["window"])
            
            attempt_count = await db.rate_limits.count_documents({
                "identifier": identifier,
                "action": action,
                "timestamp": {"$gte": window_start}
            })
            
            status[action] = {
                "attempts": attempt_count,
                "max_attempts": config["max_attempts"],
                "remaining": max(0, config["max_attempts"] - attempt_count),
                "window_seconds": config["window"],
                "is_limited": attempt_count >= config["max_attempts"]
            }
        
        return status
    
    @staticmethod
    async def reset_rate_limit(
        db: AsyncIOMotorDatabase,
        identifier: str,
        action: str
    ) -> bool:
        """Reset rate limit for specific action (admin function)"""
        
        result = await db.rate_limits.delete_many({
            "identifier": identifier,
            "action": action
        })
        
        return result.deleted_count > 0
