"""
Configuration settings for the Virtual IoT Sensor Simulator
Cloud-Connected Smart Plant Care & Watering System
"""
import os

# Device Identity
DEVICE_ID = os.getenv("DEVICE_ID", "PLANT-001")
API_KEY = os.getenv("IOT_DEVICE_API_KEY", "plant_secure_token_xyz987")

# Cloud Backend REST API Endpoint
# Default points to the local/hosted cloud server
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000")
INGEST_URL = f"{API_BASE_URL}/api/sensors/data"

# Simulator Timing
SAMPLE_INTERVAL_SECONDS = int(os.getenv("SAMPLE_INTERVAL_SECONDS", "5"))

# Physics Simulation Parameters
INITIAL_SOIL_MOISTURE = 55.0  # percentage (0-100)
NATURAL_DRYING_RATE = 0.8     # percentage lost per cycle
WATERING_RECOVERY_RATE = 25.0 # percentage gained upon watering event
BASE_TEMPERATURE = 24.0       # deg C
TEMP_AMPLITUDE = 6.0          # diurnal fluctuation
BASE_HUMIDITY = 60.0          # percentage (30-90)
HUM_AMPLITUDE = 15.0          # diurnal fluctuation
MIN_WATER_TANK_LEVEL = 15.0   # minimum percentage

# Network Resilience
MAX_RETRIES = 3
INITIAL_BACKOFF_SECONDS = 1.5
REQUEST_TIMEOUT_SECONDS = 5.0
