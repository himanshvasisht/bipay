import hashlib
import base64
import json
import time
from typing import Dict, Any, Optional
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature

# Secure canonical JSON serialization for biometric signing
def canonical_json(data: dict) -> str:
    """Create deterministic, canonical JSON for consistent signing"""
    return json.dumps(data, sort_keys=True, separators=(',', ':'))

# Enhanced biometric signature verification with comprehensive error handling
def verify_biometric_signature(public_key_pem: str, payload: dict, signature_b64: str) -> bool:
    """
    Verify biometric signature with enhanced security checks
    
    Args:
        public_key_pem: PEM-encoded public key from device
        payload: The data that was signed
        signature_b64: Base64-encoded signature
    
    Returns:
        bool: True if signature is valid, False otherwise
    """
    try:
        # Input validation
        if not public_key_pem or not payload or not signature_b64:
            return False
        
        # Use canonical JSON for consistent verification
        canonical = canonical_json(payload).encode('utf-8')
        
        # Decode signature
        try:
            signature = base64.b64decode(signature_b64)
        except Exception:
            return False
        
        # Load and validate public key
        try:
            public_key = serialization.load_pem_public_key(
                public_key_pem.encode(), 
                backend=default_backend()
            )
        except Exception:
            return False
        
        # Verify it's an RSA key with appropriate size
        if not isinstance(public_key, rsa.RSAPublicKey):
            return False
        
        key_size = public_key.key_size
        if key_size < 2048:  # Minimum secure key size
            return False
        
        # Verify signature with proper exception handling
        try:
            public_key.verify(
                signature,
                canonical,
                padding.PKCS1v15(),
                hashes.SHA256()
            )
            return True
        except InvalidSignature:
            return False
        except Exception:
            return False
            
    except Exception as e:
        # Log security events without exposing internal errors
        print(f"Biometric verification failed: {type(e).__name__}")
        return False

# Enhanced attestation validation with comprehensive checks
def validate_attestation(attestation: dict) -> Dict[str, Any]:
    """
    Validate device attestation for Android Keystore/TEE
    
    Returns:
        dict: Validation result with details
    """
    validation_result = {
        "valid": False,
        "reason": "",
        "checks": {},
        "security_level": "none"
    }
    
    try:
        # Required fields check
        required_fields = ['nonce', 'package_name', 'apk_digest', 'tee_enforced', 'timestamp']
        missing_fields = [field for field in required_fields if field not in attestation]
        
        validation_result["checks"]["required_fields"] = len(missing_fields) == 0
        if missing_fields:
            validation_result["reason"] = f"Missing required fields: {', '.join(missing_fields)}"
            return validation_result
        
        # Verify TEE enforcement
        tee_enforced = attestation.get('tee_enforced', False)
        validation_result["checks"]["tee_enforced"] = tee_enforced
        if not tee_enforced:
            validation_result["reason"] = "TEE enforcement not enabled"
            validation_result["security_level"] = "software"
            # Allow software attestation but mark as lower security
        else:
            validation_result["security_level"] = "hardware"
        
        # Verify package integrity
        expected_package = 'com.bipay.app'  # Your app package name
        package_valid = attestation.get('package_name') == expected_package
        validation_result["checks"]["package_integrity"] = package_valid
        if not package_valid:
            validation_result["reason"] = f"Invalid package name: {attestation.get('package_name')}"
            return validation_result
        
        # Verify timestamp freshness (within 5 minutes)
        timestamp = attestation.get('timestamp', 0)
        current_time = int(time.time())
        time_diff = abs(current_time - timestamp)
        timestamp_valid = time_diff <= 300  # 5 minutes
        validation_result["checks"]["timestamp_fresh"] = timestamp_valid
        if not timestamp_valid:
            validation_result["reason"] = f"Attestation too old: {time_diff} seconds"
            return validation_result
        
        # Verify nonce format (should be 32 bytes base64)
        nonce = attestation.get('nonce', '')
        try:
            nonce_bytes = base64.b64decode(nonce)
            nonce_valid = len(nonce_bytes) >= 16  # Minimum 16 bytes
        except:
            nonce_valid = False
        
        validation_result["checks"]["nonce_valid"] = nonce_valid
        if not nonce_valid:
            validation_result["reason"] = "Invalid nonce format"
            return validation_result
        
        # APK digest verification (simplified for demo)
        apk_digest = attestation.get('apk_digest', '')
        digest_valid = len(apk_digest) >= 32  # SHA-256 hash minimum
        validation_result["checks"]["apk_digest"] = digest_valid
        if not digest_valid:
            validation_result["reason"] = "Invalid APK digest"
            return validation_result
        
        # All checks passed
        validation_result["valid"] = True
        validation_result["reason"] = "All attestation checks passed"
        
        return validation_result
        
    except Exception as e:
        validation_result["reason"] = f"Attestation validation error: {type(e).__name__}"
        return validation_result

# Enhanced replay attack protection
def verify_timestamp(timestamp: int, max_age_seconds: int = 300) -> Dict[str, Any]:
    """
    Verify timestamp is within acceptable range
    
    Args:
        timestamp: Unix timestamp to verify
        max_age_seconds: Maximum age in seconds (default 5 minutes)
    
    Returns:
        dict: Verification result with details
    """
    current_time = int(time.time())
    age = current_time - timestamp
    
    result = {
        "valid": abs(age) <= max_age_seconds,
        "age_seconds": age,
        "max_age_seconds": max_age_seconds,
        "current_time": current_time,
        "provided_time": timestamp
    }
    
    if age > max_age_seconds:
        result["reason"] = "Timestamp too old (replay attack protection)"
    elif age < -max_age_seconds:
        result["reason"] = "Timestamp from future (clock skew protection)"
    else:
        result["reason"] = "Timestamp valid"
    
    return result

# Generate secure device key pair for testing
def generate_device_keypair() -> Dict[str, str]:
    """
    Generate RSA key pair for device enrollment (testing/demo purposes)
    
    Returns:
        dict: Private and public keys in PEM format
    """
    try:
        # Generate 2048-bit RSA key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        # Get public key
        public_key = private_key.public_key()
        
        # Serialize keys to PEM format
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode('utf-8')
        
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
        
        return {
            "private_key": private_pem,
            "public_key": public_pem
        }
        
    except Exception as e:
        raise RuntimeError(f"Failed to generate keypair: {e}")

# Sign payload with private key (for testing)
def sign_payload(private_key_pem: str, payload: dict) -> str:
    """
    Sign payload with private key (for testing biometric signatures)
    
    Args:
        private_key_pem: PEM-encoded private key
        payload: Data to sign
    
    Returns:
        str: Base64-encoded signature
    """
    try:
        # Load private key
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode(),
            password=None,
            backend=default_backend()
        )
        
        # Create canonical JSON
        canonical = canonical_json(payload).encode('utf-8')
        
        # Sign with private key
        signature = private_key.sign(
            canonical,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        
        # Return base64-encoded signature
        return base64.b64encode(signature).decode('utf-8')
        
    except Exception as e:
        raise RuntimeError(f"Failed to sign payload: {e}")
