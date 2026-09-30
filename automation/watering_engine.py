"""
Automated Irrigation Decision Engine
Cloud-Connected Smart Plant Care & Watering System

This engine evaluates incoming sensor streams against plant profiles,
dynamic thresholds, reservoir levels, and historical cooldowns.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Tuple

def evaluate_watering_decision(
    device_config: Dict[str, Any],
    sensor_reading: Dict[str, Any]
) -> Tuple[bool, str, int]:
    """
    Evaluates whether an irrigation pulse must be triggered.

    Returns:
        (should_water: bool, reason_message: str, pump_duration_ms: int)
    """
    soil_moisture = sensor_reading.get("soil_moisture", 50.0)
    water_tank_level = sensor_reading.get("water_tank_level", 100.0)
    threshold = device_config.get("moisture_threshold", 30.0)
    auto_enabled = device_config.get("auto_water_enabled", True)
    min_tank = device_config.get("min_tank_threshold", 15.0)
    cooldown_seconds = device_config.get("cooldown_seconds", 180)
    last_watered_at = device_config.get("last_watered_at")

    # 1. Check if automation is enabled by the grower
    if not auto_enabled:
        return False, "Automation disabled by user policy.", 0

    # 2. Check if soil is dry
    if soil_moisture >= threshold:
        return False, f"Soil moisture ({soil_moisture}%) is above threshold ({threshold}%). Irrigation not needed.", 0

    # 3. Check reservoir water level (Hardware safety: prevents motor burnout)
    if water_tank_level < min_tank:
        return False, f"Irrigation blocked: Reservoir water level ({water_tank_level}%) below minimum safety margin ({min_tank}%).", 0

    # 4. Check cooldown period to prevent rapid oscillating pulses
    if last_watered_at:
        try:
            last_dt = datetime.fromisoformat(last_watered_at.replace("Z", "+00:00"))
            now_dt = datetime.now(timezone.utc)
            elapsed_seconds = (now_dt - last_dt).total_seconds()
            if elapsed_seconds < cooldown_seconds:
                remaining = int(cooldown_seconds - elapsed_seconds)
                return False, f"Irrigation cooldown active: {remaining}s remaining to prevent over-saturation.", 0
        except Exception:
            pass

    # All criteria met: issue irrigation command
    duration_ms = device_config.get("pump_duration_ms", 3000)
    return True, f"Automated irrigation triggered: Soil moisture ({soil_moisture}%) dropped below threshold ({threshold}%).", duration_ms
