# Cloud-Connected Smart Plant Care & Watering System: System Architecture

## 1. System Overview

The system bridges low-power agricultural IoT telemetry with elastic cloud infrastructure. It operates identically whether fed by a virtual Python-based sensor simulator or real ESP32 microcontrollers deployed in physical soil beds.

---

## 2. Student Architecture (Local & Free-Tier Cloud)

```text
+-------------------------------------------------------------+
|                     Edge / Simulation Layer                 |
|   +--------------------------+   +----------------------+   |
|   | Python Virtual Sensor    |   | Physical ESP32 Node  |   |
|   | (simulator.py)           |OR | (Capacitive, DHT22)  |   |
|   +--------------------------+   +----------------------+   |
+------------------------------+------------------------------+
                               |
                   HTTPS POST /api/sensors/data
                      [x-api-key Authentication]
                               v
+-------------------------------------------------------------+
|                 Cloud Ingestion & REST API Layer            |
|   - Express.js / FastAPI REST Gateway                       |
|   - Pydantic / TypeScript Schema Validation                 |
|   - Rate Limiting & API Key Auth Guard                      |
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
| - Alert Records               |  | - Cooldown Gatekeeper    |
+-------------------------------+  +------------+-------------+
              ^                                 |
              |            Watering Directive   |
              +---------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   Real-Time Operations UI                   |
|   - React 19 + Vite Dashboard (Tabular Numerals, SVG Trend) |
|   - Manual Override Controls & Auto-Watering Toggles        |
|   - Heartbeat Monitor & Alert Dispatch Panel                |
|   - Embedded Virtual Simulation Control Studio              |
+-------------------------------------------------------------+
```

---

## 3. Enterprise Cloud Architecture (AWS / GCP / Azure Production)

```text
+-----------------------+
|  100,000+ IoT Nodes   |
|  (ESP32 / LoRaWAN)    |
+-----------+-----------+
            |
            | MQTTS / TLS 1.3 (X.509 Device Certificates)
            v
+-------------------------------------------------------------+
|   AWS IoT Core / GCP Cloud IoT Core / Azure IoT Hub         |
|   - Message Broker with Topic-based Routing                 |
|   - Device Shadow / Digital Twin for Desired Pump State     |
|   - IoT Rules Engine                                        |
+-----------+-----------------------------------+-------------+
            |                                   |
            v                                   v
+---------------------------+       +-------------------------+
| AWS Kinesis / GCP Pub/Sub |       | AWS Lambda / GCP Cloud  |
| High-throughput Stream    |       | Functions (Event-Driven)|
+-----------+---------------+       +-----------+-------------+
            |                                   |
            v                                   v
+---------------------------+       +-------------------------+
| Amazon Timestream / GCP   |       | Amazon DynamoDB / GCP   |
| Bigtable (Time-Series DB) |       | Firestore (Device State)|
+-----------+---------------+       +-----------+-------------+
            |                                   |
            +-----------------+-----------------+
                              v
+-------------------------------------------------------------+
|          API Gateway & Microservices (EKS / Cloud Run)      |
|          Amazon Cognito / Firebase Auth User Tokens         |
+-----------------------------+-------------------------------+
                              v
+-------------------------------------------------------------+
|         Enterprise Multi-Tenant React Dashboard            |
|         Amazon CloudFront CDN + S3 Static Hosting           |
+-------------------------------------------------------------+
```

---

## 4. Complete Data Flow Lifecycle

1. **Telemetry Generation**: The sensor node measures analog voltage from capacitive soil probes (0–100%) and reads digital ambient temperature (°C) and relative humidity (%).
2. **Transmission**: The payload is serialized as JSON and dispatched over HTTPS `POST` to `/api/sensors/data` with header `x-api-key: <token>`.
3. **Ingestion & Validation**: The cloud API validates payload bounds (soil 0–100%, temperature -30 to 70°C). Malformed requests return `422 Unprocessable Entity`.
4. **Heartbeat & Device State Update**: `last_seen` timestamp is updated in the device document. If an active `DEVICE_OFFLINE` alert was open, it is marked `RESOLVED`.
5. **Storage**: The reading is written to the time-series datastore (`readings`).
6. **Automation Evaluation**:
   - Condition 1: `soil_moisture < threshold`?
   - Condition 2: `water_tank_level >= 15%`?
   - Condition 3: `Date.now() - last_watered_at > cooldown_seconds`?
7. **Action Dispatch**: If all conditions hold, the virtual pump status is set to `ON`, an irrigation event is inserted into `watering_events`, and a duration directive is returned to the node.
8. **Feedback Loop**: When water infuses the root zone, the sensor reports rising moisture on subsequent cycles (e.g. 29% -> 35% -> 42% -> 55%), and the pump transitions to `OFF`.
9. **Dashboard Broadcast**: The web dashboard reflects real-time metrics, updating charts and clearing warnings without requiring page reloads.
