"""
Real-time Notification System
Multi-channel notification delivery with fraud alerts
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

class NotificationService:
    """Advanced notification system with multiple channels"""
    
    # Notification priorities
    PRIORITY_LOW = "low"
    PRIORITY_MEDIUM = "medium"
    PRIORITY_HIGH = "high"
    PRIORITY_CRITICAL = "critical"
    
    # Notification channels
    CHANNEL_PUSH = "push"
    CHANNEL_SMS = "sms"
    CHANNEL_EMAIL = "email"
    CHANNEL_IN_APP = "in_app"
    
    @staticmethod
    async def send_fraud_alert(
        db: AsyncIOMotorDatabase,
        user_id: str,
        fraud_data: Dict[str, Any],
        transaction_data: Dict[str, Any]
    ):
        """Send immediate fraud alert to user"""
        
        alert_message = f"Suspicious transaction detected: ${transaction_data.get('amount_minor', 0)/100:.2f}"
        
        notification_data = {
            "user_id": user_id,
            "type": "fraud_alert",
            "priority": NotificationService.PRIORITY_CRITICAL,
            "title": "Security Alert",
            "message": alert_message,
            "data": {
                "risk_score": fraud_data.get("overall_risk_score"),
                "risk_factors": fraud_data.get("risk_factors"),
                "transaction_id": transaction_data.get("txn_id"),
                "amount": transaction_data.get("amount_minor")
            },
            "channels": [
                NotificationService.CHANNEL_PUSH,
                NotificationService.CHANNEL_IN_APP
            ]
        }
        
        await NotificationService._deliver_notification(db, notification_data)
    
    @staticmethod
    async def send_transaction_notification(
        db: AsyncIOMotorDatabase,
        user_id: str,
        transaction_type: str,
        transaction_data: Dict[str, Any],
        success: bool = True
    ):
        """Send transaction completion notification"""
        
        amount = transaction_data.get("amount_minor", 0) / 100
        
        if success:
            title = "Payment Successful"
            message = f"${amount:.2f} payment completed"
            priority = NotificationService.PRIORITY_LOW
        else:
            title = "Payment Failed"
            message = f"${amount:.2f} payment could not be completed"
            priority = NotificationService.PRIORITY_MEDIUM
        
        notification_data = {
            "user_id": user_id,
            "type": f"transaction_{transaction_type}",
            "priority": priority,
            "title": title,
            "message": message,
            "data": transaction_data,
            "channels": [NotificationService.CHANNEL_PUSH, NotificationService.CHANNEL_IN_APP]
        }
        
        await NotificationService._deliver_notification(db, notification_data)
    
    @staticmethod
    async def send_security_notification(
        db: AsyncIOMotorDatabase,
        user_id: str,
        security_event: str,
        details: Dict[str, Any]
    ):
        """Send security-related notifications"""
        
        security_messages = {
            "new_device_login": {
                "title": "New Device Access",
                "message": "Your account was accessed from a new device",
                "priority": NotificationService.PRIORITY_HIGH
            },
            "biometric_failure": {
                "title": "Authentication Failed",
                "message": "Biometric authentication failed",
                "priority": NotificationService.PRIORITY_MEDIUM
            },
            "account_locked": {
                "title": "Account Locked",
                "message": "Your account has been temporarily locked for security",
                "priority": NotificationService.PRIORITY_CRITICAL
            },
            "password_changed": {
                "title": "Password Changed",
                "message": "Your account password was recently changed",
                "priority": NotificationService.PRIORITY_HIGH
            }
        }
        
        event_config = security_messages.get(security_event, {
            "title": "Security Alert",
            "message": "Security event detected",
            "priority": NotificationService.PRIORITY_MEDIUM
        })
        
        notification_data = {
            "user_id": user_id,
            "type": f"security_{security_event}",
            "priority": event_config["priority"],
            "title": event_config["title"],
            "message": event_config["message"],
            "data": details,
            "channels": [
                NotificationService.CHANNEL_PUSH,
                NotificationService.CHANNEL_IN_APP,
                NotificationService.CHANNEL_EMAIL
            ]
        }
        
        await NotificationService._deliver_notification(db, notification_data)
    
    @staticmethod
    async def send_compliance_notification(
        db: AsyncIOMotorDatabase,
        user_id: str,
        compliance_type: str,
        details: Dict[str, Any]
    ):
        """Send compliance-related notifications"""
        
        compliance_messages = {
            "kyc_required": {
                "title": "Verification Required",
                "message": "Please complete identity verification to continue",
                "priority": NotificationService.PRIORITY_HIGH
            },
            "kyc_expired": {
                "title": "Verification Expired",
                "message": "Your identity verification has expired",
                "priority": NotificationService.PRIORITY_HIGH
            },
            "limit_exceeded": {
                "title": "Spending Limit Reached",
                "message": "You have reached your daily/monthly spending limit",
                "priority": NotificationService.PRIORITY_MEDIUM
            },
            "aml_review": {
                "title": "Account Under Review",
                "message": "Your account is under compliance review",
                "priority": NotificationService.PRIORITY_HIGH
            }
        }
        
        event_config = compliance_messages.get(compliance_type, {
            "title": "Compliance Notice",
            "message": "Compliance action required",
            "priority": NotificationService.PRIORITY_MEDIUM
        })
        
        notification_data = {
            "user_id": user_id,
            "type": f"compliance_{compliance_type}",
            "priority": event_config["priority"],
            "title": event_config["title"],
            "message": event_config["message"],
            "data": details,
            "channels": [
                NotificationService.CHANNEL_PUSH,
                NotificationService.CHANNEL_IN_APP,
                NotificationService.CHANNEL_EMAIL
            ]
        }
        
        await NotificationService._deliver_notification(db, notification_data)
    
    @staticmethod
    async def _deliver_notification(
        db: AsyncIOMotorDatabase,
        notification_data: Dict[str, Any]
    ):
        """Internal method to deliver notifications through various channels"""
        
        # Store notification in database
        notification_record = {
            **notification_data,
            "created_at": datetime.utcnow(),
            "status": "pending",
            "delivery_attempts": 0,
            "delivered_channels": []
        }
        
        result = await db.notifications.insert_one(notification_record)
        notification_id = result.inserted_id
        
        # Deliver through each channel
        delivery_tasks = []
        for channel in notification_data.get("channels", []):
            if channel == NotificationService.CHANNEL_PUSH:
                delivery_tasks.append(
                    NotificationService._send_push_notification(
                        db, notification_data["user_id"], notification_data
                    )
                )
            elif channel == NotificationService.CHANNEL_IN_APP:
                delivery_tasks.append(
                    NotificationService._create_in_app_notification(
                        db, notification_data["user_id"], notification_data
                    )
                )
            elif channel == NotificationService.CHANNEL_EMAIL:
                delivery_tasks.append(
                    NotificationService._send_email_notification(
                        db, notification_data["user_id"], notification_data
                    )
                )
        
        # Execute delivery tasks
        if delivery_tasks:
            delivery_results = await asyncio.gather(*delivery_tasks, return_exceptions=True)
            
            # Update notification status
            successful_channels = []
            for i, result in enumerate(delivery_results):
                if not isinstance(result, Exception):
                    successful_channels.append(notification_data["channels"][i])
            
            await db.notifications.update_one(
                {"_id": notification_id},
                {
                    "$set": {
                        "status": "delivered" if successful_channels else "failed",
                        "delivered_channels": successful_channels,
                        "delivery_attempts": 1,
                        "delivered_at": datetime.utcnow()
                    }
                }
            )
    
    @staticmethod
    async def _send_push_notification(
        db: AsyncIOMotorDatabase,
        user_id: str,
        notification_data: Dict[str, Any]
    ) -> bool:
        """Send push notification to user's devices"""
        
        try:
            # Get user's FCM tokens
            user_devices = await db.devices.find({
                "user_id": user_id,
                "fcm_token": {"$exists": True, "$ne": None}
            }).to_list(10)
            
            if not user_devices:
                return False
            
            # Prepare push notification payload
            push_payload = {
                "notification": {
                    "title": notification_data["title"],
                    "body": notification_data["message"]
                },
                "data": {
                    "type": notification_data["type"],
                    "priority": notification_data["priority"],
                    **notification_data.get("data", {})
                }
            }
            
            # Send to each device (in production, use FCM batch API)
            for device in user_devices:
                # Simulate FCM call (replace with actual FCM in production)
                logging.info(f"Push notification sent to device {device['_id']}: {push_payload}")
            
            return True
            
        except Exception as e:
            logging.error(f"Push notification failed for user {user_id}: {e}")
            return False
    
    @staticmethod
    async def _create_in_app_notification(
        db: AsyncIOMotorDatabase,
        user_id: str,
        notification_data: Dict[str, Any]
    ) -> bool:
        """Create in-app notification"""
        
        try:
            in_app_notification = {
                "user_id": user_id,
                "type": notification_data["type"],
                "priority": notification_data["priority"],
                "title": notification_data["title"],
                "message": notification_data["message"],
                "data": notification_data.get("data", {}),
                "read": False,
                "created_at": datetime.utcnow()
            }
            
            await db.in_app_notifications.insert_one(in_app_notification)
            return True
            
        except Exception as e:
            logging.error(f"In-app notification failed for user {user_id}: {e}")
            return False
    
    @staticmethod
    async def _send_email_notification(
        db: AsyncIOMotorDatabase,
        user_id: str,
        notification_data: Dict[str, Any]
    ) -> bool:
        """Send email notification"""
        
        try:
            # Get user email
            user = await db.users.find_one({"_id": user_id})
            if not user or not user.get("email"):
                return False
            
            # Prepare email (in production, use proper email service)
            email_data = {
                "to": user["email"],
                "subject": notification_data["title"],
                "body": notification_data["message"],
                "type": notification_data["type"],
                "priority": notification_data["priority"]
            }
            
            # Simulate email sending (replace with actual email service in production)
            logging.info(f"Email notification sent to {user['email']}: {email_data}")
            
            return True
            
        except Exception as e:
            logging.error(f"Email notification failed for user {user_id}: {e}")
            return False
    
    @staticmethod
    async def get_user_notifications(
        db: AsyncIOMotorDatabase,
        user_id: str,
        limit: int = 50,
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Get user's in-app notifications"""
        
        query = {"user_id": user_id}
        if unread_only:
            query["read"] = False
        
        notifications = await db.in_app_notifications.find(query)\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(limit)
        
        return notifications
    
    @staticmethod
    async def mark_notification_read(
        db: AsyncIOMotorDatabase,
        notification_id: str,
        user_id: str
    ) -> bool:
        """Mark notification as read"""
        
        try:
            result = await db.in_app_notifications.update_one(
                {"_id": notification_id, "user_id": user_id},
                {"$set": {"read": True, "read_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False
