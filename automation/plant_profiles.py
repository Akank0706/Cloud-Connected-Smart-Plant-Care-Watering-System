"""
Plant Profiles and Horticultural Moisture Criteria
Cloud-Connected Smart Plant Care & Watering System
"""

from typing import Dict, Any

PLANT_PROFILES: Dict[str, Dict[str, Any]] = {
    "Succulent": {
        "moisture_threshold": 20.0,
        "optimal_temperature_min": 18.0,
        "optimal_temperature_max": 32.0,
        "description": "Drought-tolerant plants with thick water-storing leaves. Require dry potting soil between watering cycles to prevent root rot.",
        "pump_duration_seconds": 2,
        "cooldown_period_minutes": 10
    },
    "Tomato": {
        "moisture_threshold": 40.0,
        "optimal_temperature_min": 20.0,
        "optimal_temperature_max": 30.0,
        "description": "High transpiration rate during fruit growth and flowering. Requires regular, consistent soil hydration to prevent blossom-end rot and split skin.",
        "pump_duration_seconds": 4,
        "cooldown_period_minutes": 5
    },
    "Herb": {
        "moisture_threshold": 35.0,
        "optimal_temperature_min": 18.0,
        "optimal_temperature_max": 28.0,
        "description": "Shallow root systems (e.g. Basil, Mint, Parsley) requiring steady moisture without waterlogged soil to maximize aromatic oil production.",
        "pump_duration_seconds": 3,
        "cooldown_period_minutes": 5
    },
    "Indoor Plant": {
        "moisture_threshold": 30.0,
        "optimal_temperature_min": 16.0,
        "optimal_temperature_max": 26.0,
        "description": "Standard foliage plants (e.g. Monstera, Pothos, Snake Plant). Adapted to moderate indoor humidity and gentle periodic irrigation.",
        "pump_duration_seconds": 3,
        "cooldown_period_minutes": 6
    },
    "Custom": {
        "moisture_threshold": 30.0,
        "optimal_temperature_min": 15.0,
        "optimal_temperature_max": 35.0,
        "description": "User-configured thresholds and environmental ceilings for experimental crops or specialty botanical species.",
        "pump_duration_seconds": 3,
        "cooldown_period_minutes": 5
    }
}

def get_profile(plant_type: str) -> Dict[str, Any]:
    return PLANT_PROFILES.get(plant_type, PLANT_PROFILES["Custom"])
