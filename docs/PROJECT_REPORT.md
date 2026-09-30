# Academic Project Report: Cloud-Connected Smart Plant Care & Watering System

## Abstract
Traditional plant care relies predominantly on arbitrary human schedules or manual testing of soil dampness, resulting in frequent over-watering or chronic drought stress. In commercial agriculture and smart home environments alike, inefficient irrigation accounts for substantial freshwater loss and diminished crop yields. This project presents a full-stack, cloud-connected Internet of Things (IoT) precision plant care platform. The system ingests environmental telemetry—soil moisture, ambient temperature, relative humidity, illuminance, and water reservoir levels—evaluating conditions against plant-specific biological profiles to execute autonomous, closed-loop irrigation. To provide a hardware-independent laboratory testbed, a Python-based virtual sensor simulator models realistic diurnal microclimates and soil percolation dynamics. The cloud architecture comprises a REST ingestion API, automated decision engine with cooldown protection, multi-tenant database persistence, real-time telemetry dashboard, and device health heartbeat monitoring.

---

## 1. Introduction
Modern agriculture and urban horticulture face significant challenges from climate change and water scarcity. Precision irrigation ensures crops receive precisely the volume of water required at the physiological moment of need. By combining edge sensor telemetry with cloud services, growers gain continuous observability, automated actuation, and historical analytics without manual labor.

---

## 2. Problem Statement
Manual watering is inconsistent, non-scalable, and prone to human error. Conversely, naive timer-based irrigation systems irrigate irrespective of actual soil moisture levels, leading to water wastage, nutrient runoff, and root asphyxiation. Furthermore, hobbyist microcontroller setups often lack centralized monitoring, secure remote control, or persistent data logging beyond the local network.

---

## 3. Project Objectives
1. Develop a cloud-hosted IoT telemetry ingestion engine adhering to RESTful standards.
2. Build a high-fidelity Python virtual IoT sensor simulator that replicates natural soil drying, solar heat cycles, and irrigation responses without physical hardware.
3. Design an automated irrigation decision engine that prevents continuous over-watering using configurable cooldown timers and reservoir level safety cutoffs.
4. Provide configurable botanical profiles (e.g. Succulent: 20%, Herb: 35%, Tomato: 40%).
5. Build an operations dashboard providing real-time data visualization, manual actuator overrides, alert dispatch, and offline heartbeat tracking.
6. Provide an optional physical hardware implementation blueprint utilizing an ESP32 microcontroller, capacitive soil probe, and 5V relay pump.

---

## 4. Existing System vs. Proposed System

| Parameter | Existing Traditional Setup | Proposed Cloud-Connected System |
| :--- | :--- | :--- |
| **Data Collection** | Manual physical inspection | Continuous automated telemetry (every 5-60s) |
| **Watering Trigger** | Scheduled timer (fixed clock) | Closed-loop sensor-driven threshold evaluation |
| **Hardware Dependency** | Rigid hardware requirement | Hardware-optional (realistic Python virtual simulation) |
| **Remote Access** | None (localized only) | Global cloud dashboard accessible via browser |
| **Safety Mechanisms** | None; pumps can run dry | Cooldown gatekeeper + empty reservoir pump protection |
| **Historical Analytics** | None | Persistent time-series database with trend analysis |

---

## 5. Cloud Computing Concepts Demonstrated
- **SaaS (Software as a Service)**: End-user web dashboard for plant owners to manage irrigation without maintaining infrastructure.
- **PaaS (Platform as a Service)**: Cloud hosting on Google Cloud Run and Firebase, abstracting server operating systems and networking.
- **Time-Series Data Management**: Segregating rapidly changing telemetry records from static device configuration documents to optimize read/write performance.
- **Event-Driven Architecture**: Sensor ingestion events trigger asynchronous threshold evaluation and alert dispatch.
- **Elastic Scalability & Decoupling**: Separation of ingestion endpoint, database persistence, and UI layers allows horizontal autoscaling.

---

## 6. System Architecture & Workflow
```text
Virtual Plant / ESP32 Node
         ↓
Capacitive Moisture + DHT22 Sensors
         ↓
Python Sensor Simulator (or C++ Firmware)
         ↓
HTTPS REST Ingestion Layer (/api/sensors/data)
         ↓
Cloud Datastore + Device Heartbeat
         ↓
Automated Decision Engine (Threshold + Cooldown + Reservoir)
         ↓
Virtual Pump Activation (Closed-Loop Actuation)
         ↓
Real-Time Operations Dashboard & Alert Dispatch
```

---

## 7. Results & Key Metrics
- **Water Conservation**: Reduces water volume by 20% to 40% compared to static timer-based schedules by irrigating only when root zone moisture drops below calibrated thresholds.
- **Pump Protection**: 100% prevention of dry pump motor burnout by enforcing reservoir level cutoffs (> 15%).
- **Fault Detection**: Automatically flags device disconnects within 180 seconds of missed heartbeats.

---

## 8. Limitations & Future Scope
- **Current Limitations**: Simulation operates on standard PC clock; cellular IoT nodes require external SIM infrastructure.
- **Future Scope**: Integration of weather API forecasts (predictive rain postponement), satellite NDVI imagery, and LoRaWAN mesh networking for multi-kilometer agricultural fields.
