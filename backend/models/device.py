from pydantic import BaseModel, Field
from typing import Optional

class DeviceCreate(BaseModel):
    device_id: str = Field(..., example="PLANT-001")
    plant_name: str = Field(..., example="Roma Tomato")
    plant_type: Optional[str] = Field("Tomato", example="Tomato")
    location: Optional[str] = Field("Greenhouse Zone 1", example="Greenhouse Zone 1")
    moisture_threshold: Optional[float] = Field(40.0, ge=5, le=95, example=40.0)
    user_id: Optional[str] = Field("USR-STUDENT", example="USR-STUDENT")

class DeviceThresholdUpdate(BaseModel):
    moisture_threshold: Optional[float] = Field(None, ge=5, le=95)
    plant_type: Optional[str] = None
    auto_water_enabled: Optional[bool] = None

class DeviceResponse(BaseModel):
    device_id: str
    user_id: str
    plant_name: str
    plant_type: str
    location: str
    moisture_threshold: float
    auto_water_enabled: bool
    pump_status: str
    last_seen: str
    created_at: str
    status: Optional[str] = "ONLINE"
