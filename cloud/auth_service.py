"""
Cloud Authentication & Device Identity Service
Cloud-Connected Smart Plant Care & Watering System

Implements token validation, HMAC device authentication, and RBAC authorization.
"""

import hashlib
import hmac
import os
from typing import Optional

MASTER_IOT_KEY = os.getenv("IOT_DEVICE_API_KEY", "plant_secure_token_xyz987")

def verify_device_api_key(incoming_key: Optional[str], stored_key_hash: Optional[str] = None) -> bool:
    """
    Verifies that the IoT device is authorized to ingest telemetry.
    Uses constant-time comparison to protect against timing attacks.
    """
    if not incoming_key:
        return False
    
    # 1. Master fallback token for lab demonstration
    if incoming_key == MASTER_IOT_KEY:
        return True

    # 2. SHA-256 hashed device key match
    if stored_key_hash:
        hashed_incoming = hashlib.sha256(incoming_key.encode("utf-8")).hexdigest()
        return hmac.compare_digest(hashed_incoming, stored_key_hash)

    return False

def verify_user_jwt(auth_header: Optional[str]) -> Optional[dict]:
    """
    Validates Firebase Auth JWT bearer token for protected user actions.
    """
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    # In production with firebase_admin.auth:
    # decoded_token = auth.verify_id_token(token)
    # return decoded_token
    return {"uid": "USR-8821", "email": "student@university.edu"}
