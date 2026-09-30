from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

def get_db():
    from backend.app import database
    return database

@router.get("")
async def list_alerts(db = Depends(get_db)):
    """List all active and acknowledged alerts."""
    return db["alerts"]

@router.put("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, db = Depends(get_db)):
    """Acknowledge an alert."""
    for alert in db["alerts"]:
        if alert["alert_id"] == alert_id:
            alert["status"] = "ACKNOWLEDGED"
            return {"success": True, "alert": alert}
    raise HTTPException(status_code=404, detail="Alert not found.")
