"""
FastAPI Cloud Backend Application
Cloud-Connected Smart Plant Care & Watering System
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from backend.routes.sensors import router as sensors_router
from backend.routes.devices import router as devices_router
from backend.routes.alerts import router as alerts_router

# In-Memory Cloud Database Instance (Production would connect to Firestore / PostgreSQL)
database = {
    "devices": {
        "PLANT-001": {
            "device_id": "PLANT-001",
            "user_id": "USR-8821",
            "plant_name": "Heirloom Tomato",
            "plant_type": "Tomato",
            "location": "North Greenhouse Shelf A",
            "moisture_threshold": 40.0,
            "auto_water_enabled": True,
            "pump_status": "OFF",
            "last_seen": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "cooldown_seconds": 180,
            "min_tank_threshold": 15.0,
            "last_watered_at": datetime.now(timezone.utc).isoformat()
        }
    },
    "readings": [],
    "watering_events": [],
    "alerts": []
}

# Seed initial reading
database["readings"].append({
    "reading_id": "READ-INIT",
    "device_id": "PLANT-001",
    "soil_moisture": 32.0,
    "temperature": 29.4,
    "humidity": 61.0,
    "light_level": 72.0,
    "water_tank_level": 85.0,
    "timestamp": datetime.now(timezone.utc).isoformat()
})

app = FastAPI(
    title="Cloud-Connected Smart Plant Care REST API",
    description="IoT Cloud Ingestion and Precision Irrigation Automation Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensors_router)
app.include_router(devices_router)
app.include_router(alerts_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Cloud-Connected Smart Plant Care",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)
