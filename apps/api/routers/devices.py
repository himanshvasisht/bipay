from fastapi import APIRouter, HTTPException

router = APIRouter()

from fastapi import Request, HTTPException, Depends
from db import get_db
from biometric import validate_attestation, verify_timestamp
from security import JWTBearer
from security_audit import SecurityAuditLogger
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

@router.post("/enroll", dependencies=[Depends(JWTBearer())])
async def enroll_device(
    request: Request, 
    device_id: str, 
    platform: str, 
    public_key: str, 
    attestation: dict
):
    """Enhanced device enrollment with comprehensive security validation"""
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    user_id = user.get("sub") or user.get("user_id") or user.get("id")
    
    # Prepare request metadata for audit
    request_metadata = {
        "ip_address": getattr(request.client, "host", None),
        "user_agent": request.headers.get("user-agent"),
        "device_id": device_id,
        "platform": platform
    }
    
    try:
        # Validate attestation with enhanced checks
        attestation_result = validate_attestation(attestation)
        if not attestation_result["valid"]:
            await SecurityAuditLogger.log_security_event(
                db, "device_enrollment_failed", "medium", user_id,
                {
                    "reason": attestation_result["reason"],
                    "device_id": device_id,
                    "checks": attestation_result["checks"]
                },
                request_metadata
            )
            raise HTTPException(403, f"Attestation invalid: {attestation_result['reason']}")
        
        # Verify timestamp if provided
        if 'timestamp' in attestation:
            timestamp_result = verify_timestamp(attestation['timestamp'])
            if not timestamp_result["valid"]:
                await SecurityAuditLogger.log_security_event(
                    db, "device_enrollment_timestamp_invalid", "medium", user_id,
                    {
                        "reason": timestamp_result["reason"],
                        "device_id": device_id,
                        "timestamp_age": timestamp_result["age_seconds"]
                    },
                    request_metadata
                )
                raise HTTPException(403, f"Timestamp invalid: {timestamp_result['reason']}")
        
        # Check if device already exists
        existing_device = await db.devices.find_one({"_id": device_id})
        if existing_device:
            # Update existing device
            await db.devices.update_one(
                {"_id": device_id},
                {
                    "$set": {
                        "user_id": user_id,
                        "platform": platform,
                        "public_key": public_key,
                        "attestation": attestation,
                        "attestation_result": attestation_result,
                        "status": "active",
                        "updated_at": datetime.utcnow(),
                        "security_level": attestation_result["security_level"]
                    }
                }
            )
            operation = "updated"
        else:
            # Create new device
            await db.devices.insert_one({
                "_id": device_id,
                "user_id": user_id,
                "platform": platform,
                "public_key": public_key,
                "attestation": attestation,
                "attestation_result": attestation_result,
                "status": "active",
                "created_at": datetime.utcnow(),
                "security_level": attestation_result["security_level"],
                "enrollment_metadata": request_metadata
            })
            operation = "enrolled"
        
        # Log successful enrollment
        await SecurityAuditLogger.log_security_event(
            db, f"device_{operation}", "low", user_id,
            {
                "device_id": device_id,
                "platform": platform,
                "security_level": attestation_result["security_level"],
                "tee_enforced": attestation_result["checks"].get("tee_enforced", False)
            },
            request_metadata
        )
        
        return {
            "status": operation,
            "device_id": device_id,
            "security_level": attestation_result["security_level"],
            "tee_enforced": attestation_result["checks"].get("tee_enforced", False)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await SecurityAuditLogger.log_security_event(
            db, "device_enrollment_error", "high", user_id,
            {
                "error": str(e),
                "device_id": device_id
            },
            request_metadata
        )
        raise HTTPException(500, "Device enrollment failed")

@router.get("/list", dependencies=[Depends(JWTBearer())])
async def list_devices(request: Request):
    """List user's enrolled devices"""
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    user_id = user.get("sub") or user.get("user_id") or user.get("id")
    
    devices = await db.devices.find({
        "user_id": user_id,
        "status": "active"
    }).to_list(10)
    
    # Remove sensitive data from response
    safe_devices = []
    for device in devices:
        safe_device = {
            "device_id": device["_id"],
            "platform": device["platform"],
            "status": device["status"],
            "security_level": device.get("security_level", "unknown"),
            "tee_enforced": device.get("attestation_result", {}).get("checks", {}).get("tee_enforced", False),
            "created_at": device["created_at"],
            "updated_at": device.get("updated_at")
        }
        safe_devices.append(safe_device)
    
    return {"devices": safe_devices}

@router.post("/revoke/{device_id}", dependencies=[Depends(JWTBearer())])
async def revoke_device(request: Request, device_id: str):
    """Revoke device access"""
    db: AsyncIOMotorDatabase = get_db()
    user = request.state.user
    user_id = user.get("sub") or user.get("user_id") or user.get("id")
    
    # Prepare request metadata
    request_metadata = {
        "ip_address": getattr(request.client, "host", None),
        "user_agent": request.headers.get("user-agent"),
        "device_id": device_id
    }
    
    # Update device status
    result = await db.devices.update_one(
        {"_id": device_id, "user_id": user_id},
        {
            "$set": {
                "status": "revoked",
                "revoked_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(404, "Device not found")
    
    # Log device revocation
    await SecurityAuditLogger.log_security_event(
        db, "device_revoked", "medium", user_id,
        {"device_id": device_id},
        request_metadata
    )
    
    return {"status": "revoked", "device_id": device_id}
