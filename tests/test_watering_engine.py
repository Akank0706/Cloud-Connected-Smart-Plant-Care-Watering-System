"""
Unit Tests for Irrigation Automation Engine
Cloud-Connected Smart Plant Care & Watering System
"""

import unittest
from datetime import datetime, timezone, timedelta
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from automation.watering_engine import evaluate_watering_decision
from automation.plant_profiles import PLANT_PROFILES

class TestWateringEngine(unittest.TestCase):
    def setUp(self):
        self.device_config = {
            "device_id": "PLANT-TEST",
            "moisture_threshold": 35.0,
            "auto_water_enabled": True,
            "min_tank_threshold": 15.0,
            "cooldown_seconds": 180,
            "pump_duration_ms": 3000,
            "last_watered_at": None
        }

    def test_adequate_moisture_does_not_trigger(self):
        """TC-08: Soil above threshold must NOT activate watering."""
        reading = {"soil_moisture": 45.0, "water_tank_level": 80.0}
        should_water, reason, duration = evaluate_watering_decision(self.device_config, reading)
        self.assertFalse(should_water)
        self.assertEqual(duration, 0)
        self.assertIn("above threshold", reason)

    def test_low_moisture_triggers_watering(self):
        """TC-10: Soil below threshold triggers watering pulse."""
        reading = {"soil_moisture": 28.0, "water_tank_level": 80.0}
        should_water, reason, duration = evaluate_watering_decision(self.device_config, reading)
        self.assertTrue(should_water)
        self.assertEqual(duration, 3000)
        self.assertIn("dropped below threshold", reason)

    def test_empty_tank_prevents_watering(self):
        """Hardware protection: Tank below minimum prevents pump burnout."""
        reading = {"soil_moisture": 25.0, "water_tank_level": 8.0}
        should_water, reason, duration = evaluate_watering_decision(self.device_config, reading)
        self.assertFalse(should_water)
        self.assertEqual(duration, 0)
        self.assertIn("below minimum safety margin", reason)

    def test_cooldown_prevents_rapid_cycling(self):
        """TC-13: Cooldown period stops overwatering."""
        recent_water_time = (datetime.now(timezone.utc) - timedelta(seconds=60)).isoformat()
        self.device_config["last_watered_at"] = recent_water_time
        
        reading = {"soil_moisture": 22.0, "water_tank_level": 90.0}
        should_water, reason, duration = evaluate_watering_decision(self.device_config, reading)
        self.assertFalse(should_water)
        self.assertIn("cooldown active", reason)

    def test_automation_disabled_toggle(self):
        """Manual-only mode respects user setting."""
        self.device_config["auto_water_enabled"] = False
        reading = {"soil_moisture": 15.0, "water_tank_level": 90.0}
        should_water, reason, duration = evaluate_watering_decision(self.device_config, reading)
        self.assertFalse(should_water)
        self.assertIn("disabled by user policy", reason)

if __name__ == "__main__":
    unittest.main()
