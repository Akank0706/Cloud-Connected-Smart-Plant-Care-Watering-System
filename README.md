# Cloud-Connected Smart Plant Care & Watering System

> **Enterprise-grade IoT cloud platform for precision plant care featuring simulated IoT sensors, cloud data storage, automated irrigation decision logic, real-time monitoring, alerts, and scalable cloud architecture.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Cloud Architecture](https://img.shields.io/badge/Architecture-IoT--to--Cloud-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

---

## 1. Overview
The **Cloud-Connected Smart Plant Care & Watering System** is an end-to-end IoT platform designed to optimize irrigation and plant wellness through continuous environmental telemetry and automated closed-loop actuation. 

Because physical microcontrollers, sensors, and pumps are not always available to students and cloud engineers, this repository provides a **fully executable Python virtual IoT sensor simulator** that models realistic botanical microclimates without requiring physical hardware. An optional, production-ready **ESP32 C++ firmware blueprint** is also included for real-world deployment.

---

## 2. Problem Statement
Manual watering is irregular and prone to human error, resulting in plant stress, stunted root growth, and significant water wastage. Traditional timer-based irrigation schedules water blindly regardless of actual soil moisture levels. Moreover, basic DIY microcontroller tutorials fail to demonstrate modern cloud patterns such as authenticated REST ingestion, time-series data storage, automated decision engines with cooldown protections, and real-time operations dashboards.

---

## 3. Objectives
* Provide a **zero-hardware-dependency** virtual simulation reproducing natural soil moisture decay, solar diurnal curves, and irrigation recovery.
* Implement a robust **Cloud REST Ingestion API** with schema validation and authentication guards.
* Design an **Automated Watering Engine** that enforces moisture thresholds, reservoir level safety cutoffs, and cooldown gates to prevent rapid cycling.
* Build a high-density, professional **React Operations Dashboard** with real-time telemetry streaming, interactive SVG trend lines, alert acknowledgments, and manual overrides.
* Provide an end-to-end **25-case automated test runner** validating sensor ingestion, safety thresholds, and fault handling.

---

## 4. Features
* **Virtual IoT Physics Engine**: Gradual soil moisture decay, diurnal day/night sunlight and temperature cycles, and dynamic moisture rebound upon watering.
* **Closed-Loop Irrigation Automation**: Compares soil moisture against plant-specific biological thresholds (Tomato 40%, Succulent 20%, Herb 35%, Indoor 30%).
* **Safety & Protection Guardrails**: Cooldown period (180s-300s) prevents over-saturation; reservoir safety margin (>15%) stops pump dry burnout.
* **Heartbeat & Offline Detection**: Automatically flags inactive devices as `OFFLINE` if no heartbeat is received within 180 seconds.
* **Alerts Dispatcher**: Hierarchical severity levels (`INFO`, `WARNING`, `CRITICAL`) with acknowledgment workflow.
* **Agricultural Analytics Engine**: Calculates min/max/average soil moisture, ambient temperature trends, total watering volume (liters), and device uptime percentage.

---

## 5. System Architecture

```text
+-------------------------------------------------------------+
|                      Edge Sensor Layer                      |
|   +--------------------------+   +----------------------+   |
|   | Python Virtual Sensor    |   | ESP32-WROOM-32 Node  |   |
|   | (sensor_simulator/)      |OR | (firmware/*.ino)     |   |
|   +--------------------------+   +----------------------+   |
+------------------------------+------------------------------+
                               |
               HTTPS POST /api/sensors/data (x-api-key)
                               v
+-------------------------------------------------------------+
|                    Cloud Backend & REST API                 |
|   - Express.js / FastAPI Telemetry Ingestion Gateway        |
|   - Request Validation & Device Heartbeat Tracker           |
+------------------------------+------------------------------+
                               |
              +----------------+----------------+
              |                                 |
              v                                 v
+-------------------------------+  +--------------------------+
|      Database Persistence     |  | Automated Irrigation     |
| - Devices Collection          |  | Decision Engine          |
| - Time-Series Readings        |  | - Soil Threshold Check   |
| - Watering Event Logs         |  | - Reservoir Tank Safety  |
| - Alerts Store                |  | - Cooldown Gatekeeper    |
+-------------------------------+  +--------------------------+
              ^                                 |
              |            Watering Directive   |
              +---------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   Operations Web Dashboard                  |
|   - React 19 + Vite Real-Time Telemetry Monitor             |
|   - Manual Override Controls & Automation Config            |
|   - 25-Case Automated Verification Test Suite               |
+-------------------------------------------------------------+
```

---

## 6. Technology Stack
* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons.
* **Backend**: Express.js full-stack runtime & Python FastAPI microservice (`backend/app.py`).
* **Simulation**: Python 3 standard library (`sensor_simulator/simulator.py`).
* **Cloud & Persistence**: Firestore Schema & Security Rules (`cloud/firestore_rules.txt`), REST API contracts.
* **Hardware (Optional)**: ESP32 C++ firmware (`firmware/esp32_plant_monitor.ino`) using Arduino Core.

---

## 7. Folder Structure
```text
Cloud-Smart-Plant-Care/
├── sensor_simulator/
│   ├── simulator.py         # Standalone Python virtual IoT sensor
│   └── config.py            # Physics parameters and API target config
├── backend/
│   ├── app.py               # FastAPI application entry point
│   ├── routes/              # Modular REST routes (sensors, devices, alerts)
│   ├── models/              # Pydantic schema validation models
│   └── services/            # Analytics and irrigation business logic
├── automation/
│   ├── watering_engine.py   # Decision logic and cooldown checks
│   └── plant_profiles.py    # Horticultural moisture criteria
├── firmware/
│   └── esp32_plant_monitor.ino # Production Arduino C++ firmware for ESP32
├── cloud/
│   ├── database_service.py  # Firestore / Cloud SQL abstraction
│   ├── auth_service.py      # Token & HMAC device key validation
│   └── firestore_rules.txt  # Security rules for multi-tenant isolation
├── tests/
│   ├── test_backend.py      # Automated API integration tests
│   └── test_watering_engine.py # Unit tests for irrigation logic
├── docs/
│   ├── ARCHITECTURE.md      # Detailed student vs enterprise design
│   ├── API_DOCUMENTATION.md # Complete REST endpoint specifications
│   ├── INTERVIEW_PREPARATION.md # Top 10 viva & interview answers
│   └── PROJECT_REPORT.md    # Full academic project report
├── sample_data/             # Seed JSON records for offline development
├── src/                     # React 19 frontend application
├── server.ts                # Full-stack Express server on port 3000
├── requirements.txt         # Python dependencies
├── .env.example             # Configuration template
└── README.md
```

---

## 8. Installation & Execution

### Option A: Run the Complete Web Dashboard & Live REST API
```bash
# 1. Install dependencies
npm install

# 2. Start the full-stack server (runs on port 3000)
npm run dev
```
Open `http://localhost:3000` to interact with the live telemetry dashboard, trigger manual irrigation, adjust thresholds, and test the simulator.

### Option B: Run the Python Virtual Sensor Simulator
In a separate terminal window:
```bash
# Run the Python virtual sensor simulator
python3 sensor_simulator/simulator.py
```
The simulator will immediately start generating realistic telemetry (soil moisture, temperature, humidity, daylight) and posting it to the cloud backend.

### Option C: Run the Automated Backend Tests
```bash
# Run Python unit & API test suites
python3 -m unittest discover tests/
```

---

## 9. Hardware Blueprint (Optional Real ESP32)
* **MCU**: ESP32-WROOM-32 (Wi-Fi 2.4 GHz)
* **Soil Sensor**: Capacitive Soil Moisture Sensor v1.2 (Analog pin `GPIO 34`)
* **Air Sensor**: DHT22 Temperature & Humidity (Digital pin `GPIO 4`)
* **Pump Actuator**: 5V Relay Module or Logic-Level MOSFET driving 5-12V DC mini pump (`GPIO 26`)
* **Firmware**: Open `firmware/esp32_plant_monitor.ino` in Arduino IDE or PlatformIO, enter your local Wi-Fi credentials and API URL, and flash the board.

---

## 10. License
This project is open-source under the MIT License.
