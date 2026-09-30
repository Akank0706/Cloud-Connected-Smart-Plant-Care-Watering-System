"""
Automated Backend REST API Test Suite
Cloud-Connected Smart Plant Care & Watering System
"""

import unittest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.app import app

class TestPlantCareAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        """TC-03: Basic health check endpoint."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_telemetry_ingestion_valid(self):
        """TC-03: Ingest valid sensor telemetry."""
        payload = {
            "device_id": "PLANT-001",
            "soil_moisture": 32.5,
            "temperature": 27.8,
            "humidity": 58.0,
            "light_level": 70.0,
            "water_tank_level": 82.0
        }
        response = self.client.post("/api/sensors/data", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("reading_id", data)

    def test_telemetry_validation_out_of_range(self):
        """TC-04: Out-of-bounds soil moisture rejected with HTTP 422."""
        payload = {
            "device_id": "PLANT-001",
            "soil_moisture": 145.0, # Invalid > 100%
            "temperature": 27.8,
            "humidity": 58.0
        }
        response = self.client.post("/api/sensors/data", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_get_devices_list(self):
        """TC-06: Query all devices."""
        response = self.client.get("/api/devices")
        self.assertEqual(response.status_code, 200)
        devices = response.json()
        self.assertIsInstance(devices, list)
        self.assertGreater(len(devices), 0)

    def test_update_threshold(self):
        """TC-24: Update plant threshold."""
        payload = {"moisture_threshold": 42.0}
        response = self.client.put("/api/devices/PLANT-001/threshold", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["device"]["moisture_threshold"], 42.0)

    def test_manual_water_action(self):
        """TC-14: Manual water trigger."""
        response = self.client.post("/api/devices/PLANT-001/water?duration_ms=2500")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["event"]["trigger_type"], "manual")

if __name__ == "__main__":
    unittest.main()
