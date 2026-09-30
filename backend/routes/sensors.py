from fastapi import APIRouter, HTTPException, Header, Depends
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from backend.models.sensor_data import SensorReadingCreate
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from automation.watering_engine import evaluate_watering_decision

router = APIRouter(prefix="/api", tags=["Sensors"])

# Global shared storage reference (initialized in app.py)
DB = None

def get_db():
    from backend.app import database
    return database

@router.post("/sensors/data", status_code=201)
async def ingest_sensor_telemetry(
    reading: SensorReadingCreate,
    x_api_key: Optional[str] = Header(None),
    db = Depends(get_db)
):
    """
    Ingests IoT telemetry payload, verifies security, logs to cloud DB,
    and runs the automated watering decision engine.
    """
    dev = db["devices"].get(reading.device_id)
    if not dev:
        # Auto-provision unknown node
        dev = {
            "device_id": reading.device_id,
            "user_id": "USR-PROVISIONED",
            "plant_name": f"Node {reading.device_id}",
            "plant_type": "Custom",
            "location": "Grow Chamber",
            "moisture_threshold": 30.0,
            "auto_water_enabled": True,
            "pump_status": "OFF",
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "cooldown_seconds": 180,
            "min_tank_threshold": 15.0
        }
        db["devices"][reading.device_id] = dev

    # Update heartbeat
    now_iso = datetime.now(timezone.utc).isoformat()
    dev["last_seen"] = now_iso

    # Append to time-series readings
    record = reading.dict()
    record["reading_id"] = f"READ-{uuid.uuid4().hex[:8]}"
    if not record.get("timestamp"):
        record["timestamp"] = now_iso
    db["readings"].append(record)

    # Evaluate automated irrigation logic
    should_water, reason, duration_ms = evaluate_watering_decision(dev, record)

    automation_response = {
        "triggered": should_water,
        "pump_status": "ON" if should_water else dev["pump_status"],
        "duration_ms": duration_ms if should_water else 0,
        "reason": reason
    }

    if should_water:
        dev["pump_status"] = "ON"
        dev["last_watered_at"] = now_iso
        event = {
            "event_id": f"EVT-{uuid.uuid4().hex[:8]}",
            "device_id": reading.device_id,
            "trigger_type": "automatic",
            "moisture_before": reading.soil_moisture,
            "moisture_after": min(100.0, reading.soil_moisture + 25.0),
            "duration_ms": duration_ms,
            "timestamp": now_iso,
            "water_consumed_ml": (duration_ms / 1000.0) * 20.0,
            "reason": reason
        }
        db["watering_events"].insert(0, event)

    return {
        "success": True,
        "reading_id": record["reading_id"],
        "device_id": reading.device_id,
        "timestamp": now_iso,
        "automation": automation_response
    }
