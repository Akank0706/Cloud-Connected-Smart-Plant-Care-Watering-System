#!/usr/bin/env python3
"""
Virtual IoT Sensor Simulator
Cloud-Connected Smart Plant Care & Watering System

This simulator mimics physical hardware (ESP32 + capacitive soil moisture sensor +
DHT22 temperature/humidity + light photoresistor + water reservoir gauge) without
requiring any physical equipment.

Key behaviors:
1. Gradual natural soil moisture reduction over time.
2. Diurnal solar cycle: temperature rises with simulated daylight; humidity drops.
3. Automated pump reaction: when the cloud backend signals irrigation activation,
   soil moisture realistically spikes upwards over successive cycles.
4. Robust network handling: HTTP retries with exponential backoff and offline spooling.
"""

import sys
import time
import math
import json
import logging
import datetime
import urllib.request
import urllib.error
import random

from config import (
    DEVICE_ID,
    API_KEY,
    INGEST_URL,
    SAMPLE_INTERVAL_SECONDS,
    INITIAL_SOIL_MOISTURE,
    NATURAL_DRYING_RATE,
    WATERING_RECOVERY_RATE,
    BASE_TEMPERATURE,
    TEMP_AMPLITUDE,
    BASE_HUMIDITY,
    HUM_AMPLITUDE,
    MAX_RETRIES,
    INITIAL_BACKOFF_SECONDS,
    REQUEST_TIMEOUT_SECONDS
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (Virtual-IoT) %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("VirtualSensor")

class VirtualPlantNode:
    def __init__(self, device_id: str):
        self.device_id = device_id
        self.soil_moisture = INITIAL_SOIL_MOISTURE
        self.water_tank_level = 90.0
        self.step_count = 0
        self.is_watering_active = False
        self.watering_steps_remaining = 0
        self.offline_queue = []

    def compute_environmental_physics(self):
        """
        Simulate continuous physical micro-climate:
        - Light follows daytime solar elevation.
        - Temperature peaks midday and cools at night.
        - Humidity is inversely proportional to temperature.
        - Soil moisture decays slowly until watered.
        """
        self.step_count += 1
        
        # Virtual 24-hour cycle mapped over every 120 steps (or realistic clock)
        cycle_angle = (self.step_count % 120) / 120.0 * 2.0 * math.pi
        
        # Light level (0 to 100%) - simulates daylight curve
        solar_elevation = math.sin(cycle_angle - math.pi / 2)
        light_level = max(0.0, min(100.0, (solar_elevation + 1.0) / 2.0 * 95.0 + random.uniform(-2, 2)))
        
        # Temperature (approx 18C - 34C)
        temp_variation = math.sin(cycle_angle - math.pi / 3) * TEMP_AMPLITUDE
        temperature = BASE_TEMPERATURE + temp_variation + random.uniform(-0.4, 0.4)
        
        # Humidity (approx 35% - 85%)
        hum_variation = -math.sin(cycle_angle - math.pi / 3) * HUM_AMPLITUDE
        humidity = BASE_HUMIDITY + hum_variation + random.uniform(-1.0, 1.0)
        
        # Soil Moisture Dynamics:
        if self.is_watering_active and self.watering_steps_remaining > 0:
            # Water is being injected into the soil pot
            moisture_boost = (WATERING_RECOVERY_RATE / 4.0) + random.uniform(0.5, 1.5)
            self.soil_moisture = min(85.0, self.soil_moisture + moisture_boost)
            self.water_tank_level = max(5.0, self.water_tank_level - 1.5)
            self.watering_steps_remaining -= 1
            logger.info(f"💦 Virtual Pump Infusing Soil: Moisture rising -> {self.soil_moisture:.1f}%")
            if self.watering_steps_remaining <= 0:
                self.is_watering_active = False
                logger.info("🛑 Virtual Irrigation pulse finished. Soil saturation stabilized.")
        else:
            # Natural gradual drying through transpiration & evaporation
            evap_multiplier = 1.0 + (temperature - 20.0) * 0.03 + (light_level / 100.0) * 0.4
            loss = NATURAL_DRYING_RATE * evap_multiplier + random.uniform(-0.1, 0.1)
            self.soil_moisture = max(8.0, self.soil_moisture - max(0.2, loss))
            
        return {
            "device_id": self.device_id,
            "soil_moisture": round(self.soil_moisture, 1),
            "temperature": round(temperature, 1),
            "humidity": round(max(10.0, min(99.0, humidity)), 1),
            "light_level": round(light_level, 1),
            "water_tank_level": round(self.water_tank_level, 1),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    def send_telemetry(self, payload: dict) -> bool:
        """
        Sends payload to Cloud REST API with exponential backoff and error handling.
        """
        json_data = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "User-Agent": "VirtualESP32-Firmware/2.4"
        }

        req = urllib.request.Request(INGEST_URL, data=json_data, headers=headers, method="POST")

        backoff = INITIAL_BACKOFF_SECONDS
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SECONDS) as response:
                    status_code = response.getcode()
                    resp_body = response.read().decode("utf-8")
                    data = json.loads(resp_body)
                    
                    logger.info(
                        f"📡 [POST {status_code}] Soil: {payload['soil_moisture']}% | "
                        f"Temp: {payload['temperature']}°C | Hum: {payload['humidity']}% | "
                        f"Tank: {payload['water_tank_level']}%"
                    )

                    # Check automated decision returned by cloud automation engine
                    automation = data.get("automation", {})
                    if automation.get("triggered") or automation.get("pump_status") == "ON":
                        logger.warning(f"⚡ CLOUD WATERING DIRECTIVE RECEIVED: {automation.get('reason')}")
                        self.is_watering_active = True
                        self.watering_steps_remaining = 4  # Simulate moisture increase over next 4 readings
                    return True

            except urllib.error.HTTPError as e:
                logger.error(f"HTTP Error {e.code} on attempt {attempt}/{MAX_RETRIES}: {e.reason}")
                if e.code in [400, 422, 401]:
                    # Unrecoverable validation or authentication errors
                    return False
            except urllib.error.URLError as e:
                logger.warning(f"Network Connection Failed (attempt {attempt}/{MAX_RETRIES}): {e.reason}")
            except Exception as e:
                logger.error(f"Unexpected transmission error: {e}")

            if attempt < MAX_RETRIES:
                logger.info(f"Retrying in {backoff:.1f}s...")
                time.sleep(backoff)
                backoff *= 2

        # Enqueue offline reading if backend is unreachable
        logger.warning("Spooling sensor record to local offline buffer.")
        self.offline_queue.append(payload)
        if len(self.offline_queue) > 100:
            self.offline_queue.pop(0)
        return False

def run_simulation():
    logger.info("=" * 65)
    logger.info("🌱 STARTING CLOUD-CONNECTED VIRTUAL IOT SENSOR SIMULATOR")
    logger.info(f"Target Device ID : {DEVICE_ID}")
    logger.info(f"Target Endpoint  : {INGEST_URL}")
    logger.info(f"Sampling Interval: {SAMPLE_INTERVAL_SECONDS} seconds")
    logger.info("Mode             : Standalone Python Virtual Hardware Simulator")
    logger.info("=" * 65)

    node = VirtualPlantNode(DEVICE_ID)

    try:
        while True:
            reading = node.compute_environmental_physics()
            node.send_telemetry(reading)
            time.sleep(SAMPLE_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        logger.info("\nSimulation stopped by user. Shutting down virtual IoT node safely.")
        sys.exit(0)

if __name__ == "__main__":
    run_simulation()
