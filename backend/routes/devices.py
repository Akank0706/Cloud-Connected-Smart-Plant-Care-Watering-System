from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from backend.models.device import DeviceCreate, DeviceThresholdUpdate

router = APIRouter(prefix="/api/devices", tags=["Devices"])

def get_db():
    from backend.app import database
    return database

@router.get("")
async def list_devices(db = Depends(get_db)):
    """List all registered devices with online/offline status."""
    now_ts = datetime.now(timezone.utc).timestamp()
    results = []
    for dev in db["devices"].values():
        dev_copy = dict(dev)
        last_dt = datetime.fromisoformat(dev["last_seen"].replace("Z", "+00:00")).timestamp()
        is_offline = (now_ts - last_dt) > 180
        dev_copy["status"] = "OFFLINE" if is_offline else "ONLINE"
        # Latest reading
        dev_readings = [r for r in db["readings"] if r["device_id"] == dev["device_id"]]
        dev_copy["latest_reading"] = dev_readings[-1] if dev_readings else None
        results.append(dev_copy)
    return results

@router.post("", status_code=201)
async def register_device(payload: DeviceCreate, db = Depends(get_db)):
    """Register new plant monitoring device."""
    if payload.device_id in db["devices"]:
        raise HTTPException(status_code=409, detail=f"Device {payload.device_id} already exists.")
    
    now_iso = datetime.now(timezone.utc).isoformat()
    new_dev = {
        "device_id": payload.device_id,
        "user_id": payload.user_id,
        "plant_name": payload.plant_name,
        "plant_type": payload.plant_type,
        "location": payload.location,
        "moisture_threshold": payload.moisture_threshold,
        "auto_water_enabled": True,
        "pump_status": "OFF",
        "last_seen": now_iso,
        "created_at": now_iso,
        "cooldown_seconds": 180,
        "min_tank_threshold": 15.0
    }
    db["devices"][payload.device_id] = new_dev
    return new_dev

@router.get("/{device_id}")
async def get_device(device_id: str, db = Depends(get_db)):
    """Get single device metadata."""
    dev = db["devices"].get(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found.")
    return dev

@router.get("/{device_id}/latest")
async def get_device_latest_reading(device_id: str, db = Depends(get_db)):
    """Fetch latest sensor reading for a specific device."""
    dev_readings = [r for r in db["readings"] if r["device_id"] == device_id]
    if not dev_readings:
        raise HTTPException(status_code=404, detail="No readings found for this device.")
    return dev_readings[-1]

@router.get("/{device_id}/history")
async def get_device_history(device_id: str, limit: int = 50, db = Depends(get_db)):
    """Fetch historical readings for time-series charts."""
    dev_readings = [r for r in db["readings"] if r["device_id"] == device_id]
    return dev_readings[-limit:]

@router.put("/{device_id}/threshold")
async def update_device_threshold(device_id: str, payload: DeviceThresholdUpdate, db = Depends(get_db)):
    """Update moisture threshold, plant profile, or automation status."""
    dev = db["devices"].get(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found.")
    
    if payload.moisture_threshold is not None:
        dev["moisture_threshold"] = payload.moisture_threshold
    if payload.plant_type is not None:
        dev["plant_type"] = payload.plant_type
    if payload.auto_water_enabled is not None:
        dev["auto_water_enabled"] = payload.auto_water_enabled
    
    return {"success": True, "device": dev}

@router.post("/{device_id}/water")
async def trigger_manual_water(device_id: str, duration_ms: int = 3000, db = Depends(get_db)):
    """Manually trigger watering action."""
    dev = db["devices"].get(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found.")
    
    now_iso = datetime.now(timezone.utc).isoformat()
    dev["pump_status"] = "ON"
    dev["last_watered_at"] = now_iso

    dev_readings = [r for r in db["readings"] if r["device_id"] == device_id]
    before_val = dev_readings[-1]["soil_moisture"] if dev_readings else 30.0

    event = {
        "event_id": f"EVT-{uuid.uuid4().hex[:8]}",
        "device_id": device_id,
        "trigger_type": "manual",
        "moisture_before": before_val,
        "moisture_after": min(100.0, before_val + 25.0),
        "duration_ms": duration_ms,
        "timestamp": now_iso,
        "water_consumed_ml": (duration_ms / 1000.0) * 20.0,
        "reason": "Manual operator override from Cloud Dashboard"
    }
    db["watering_events"].insert(0, event)

    return {"success": True, "event": event}

@router.get("/{device_id}/watering-history")
async def get_watering_history(device_id: str, db = Depends(get_db)):
    """Fetch watering events history."""
    events = [e for e in db["watering_events"] if e["device_id"] == device_id]
    return events
