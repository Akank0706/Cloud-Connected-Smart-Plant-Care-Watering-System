# REST API Specification: Cloud-Connected Smart Plant Care

This document details the REST APIs implemented by the backend platform.

---

### 1. Ingest Sensor Telemetry
* **Method**: `POST`
* **Endpoint**: `/api/sensors/data`
* **Headers**: `x-api-key: <string>` (Required)
* **Request Body**:
```json
{
  "device_id": "PLANT-001",
  "soil_moisture": 32.5,
  "temperature": 28.4,
  "humidity": 61.2,
  "light_level": 75.0,
  "water_tank_level": 88.0,
  "timestamp": "2026-09-29T12:00:00Z"
}
```
* **Validation**:
  * `device_id`: Non-empty string
  * `soil_moisture`: Float in range `[0.0, 100.0]`
  * `temperature`: Float in range `[-30.0, 70.0]`
  * `humidity`: Float in range `[0.0, 100.0]`
* **Response `201 Created`**:
```json
{
  "success": true,
  "reading_id": "READ-1727618400000",
  "device_id": "PLANT-001",
  "timestamp": "2026-09-29T12:00:00Z",
  "automation": {
    "triggered": true,
    "pump_status": "ON",
    "duration_ms": 3000,
    "reason": "Automated irrigation: Soil moisture (32.5%) dropped below target threshold (40%)."
  }
}
```
* **Errors**: `400 Bad Request` (missing device_id), `401 Unauthorized` (bad key), `422 Unprocessable Entity` (out of range).

---

### 2. List All Devices
* **Method**: `GET`
* **Endpoint**: `/api/devices`
* **Response `200 OK`**:
```json
[
  {
    "device_id": "PLANT-001",
    "user_id": "USR-8821",
    "plant_name": "Heirloom Tomato",
    "plant_type": "Tomato",
    "location": "North Greenhouse Shelf A",
    "moisture_threshold": 40.0,
    "auto_water_enabled": true,
    "pump_status": "OFF",
    "last_seen": "2026-09-29T12:00:00Z",
    "status": "ONLINE",
    "latest_reading": { ... }
  }
]
```

---

### 3. Register Device
* **Method**: `POST`
* **Endpoint**: `/api/devices`
* **Request Body**:
```json
{
  "device_id": "PLANT-004",
  "plant_name": "Japanese Bonsai",
  "plant_type": "Indoor Plant",
  "location": "Balcony Table",
  "moisture_threshold": 25.0
}
```
* **Response `201 Created`**: Returns device object.
* **Errors**: `400 Bad Request`, `409 Conflict` (device_id already registered).

---

### 4. Get Single Device
* **Method**: `GET`
* **Endpoint**: `/api/devices/{id}`
* **Response `200 OK`**: Device details with online status.
* **Errors**: `404 Not Found`.

---

### 5. Get Latest Telemetry Reading
* **Method**: `GET`
* **Endpoint**: `/api/devices/{id}/latest`
* **Response `200 OK`**: Most recent `SensorReading` object.
* **Errors**: `404 Not Found`.

---

### 6. Get Historical Telemetry Stream
* **Method**: `GET`
* **Endpoint**: `/api/devices/{id}/history?limit=50`
* **Query Parameters**: `limit` (default: 50, max: 200)
* **Response `200 OK`**: Chronological array of `SensorReading` objects.

---

### 7. Update Moisture Threshold & Profile
* **Method**: `PUT`
* **Endpoint**: `/api/devices/{id}/threshold`
* **Request Body**:
```json
{
  "moisture_threshold": 38.0,
  "plant_type": "Tomato",
  "auto_water_enabled": true
}
```
* **Response `200 OK`**: Returns updated device configuration.

---

### 8. Manual Watering Override
* **Method**: `POST`
* **Endpoint**: `/api/devices/{id}/water`
* **Request Body**:
```json
{
  "duration_ms": 3000
}
```
* **Response `200 OK`**: Returns watering event log and sets pump status to ON.

---

### 9. Get Watering History Logs
* **Method**: `GET`
* **Endpoint**: `/api/devices/{id}/watering-history`
* **Response `200 OK`**: Array of `WateringEvent` logs.

---

### 10. Query System Alerts
* **Method**: `GET`
* **Endpoint**: `/api/alerts`
* **Response `200 OK`**: Array of active and resolved `AlertItem` objects.

---

### 11. Acknowledge Alert
* **Method**: `PUT`
* **Endpoint**: `/api/alerts/{id}/acknowledge`
* **Response `200 OK`**: Returns acknowledged alert with status updated.
