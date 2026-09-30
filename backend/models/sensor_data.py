from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SensorReadingCreate(BaseModel):
    device_id: str = Field(..., example="PLANT-001")
    soil_moisture: float = Field(..., ge=0, le=100, example=32.0)
    temperature: float = Field(..., ge=-40, le=80, example=28.5)
    humidity: float = Field(..., ge=0, le=100, example=62.0)
    light_level: Optional[float] = Field(50.0, ge=0, le=100, example=75.0)
    water_tank_level: Optional[float] = Field(80.0, ge=0, le=100, example=90.0)
    timestamp: Optional[str] = None

class SensorReadingResponse(SensorReadingCreate):
    reading_id: str
    timestamp: str

class WateringEventRecord(BaseModel):
    event_id: str
    device_id: str
    trigger_type: str # 'automatic' | 'manual'
    moisture_before: float
    moisture_after: Optional[float] = None
    duration_ms: int
    timestamp: str
    water_consumed_ml: float
    reason: Optional[str] = None
