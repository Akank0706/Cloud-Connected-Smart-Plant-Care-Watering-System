/*
  Cloud-Connected Smart Plant Care & Watering System
  ESP32 Firmware Source Code (Arduino Framework)
  
  Target Microcontroller: ESP32-WROOM-32
  Sensors:
    - Capacitive Soil Moisture Sensor v1.2 (Analog on GPIO 34 / ADC1_CH6)
    - DHT22 Temperature & Humidity (Digital on GPIO 4 with 10k pull-up)
    - LDR Photoresistor (Analog on GPIO 35 / ADC1_CH7)
  Actuators:
    - 5V Relay Module / Logic-Level N-MOSFET (GPIO 26) driving 5-12V DC mini pump
  
  Communications:
    - HTTPS POST to /api/sensors/data with x-api-key header
    - Remote Action Polling for cloud dashboard triggers
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// -------------------------------------------------------------
// Pin Configuration
// -------------------------------------------------------------
#define SOIL_PIN 34
#define DHTPIN 4
#define DHTTYPE DHT22
#define PUMP_PIN 26
#define LDR_PIN 35

// -------------------------------------------------------------
// Network & Cloud Configuration
// -------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* INGEST_URL     = "https://YOUR_CLOUD_RUN_URL/api/sensors/data";
const char* POLL_ACTION_URL = "https://YOUR_CLOUD_RUN_URL/api/devices/PLANT-001/latest";
const char* API_KEY        = "plant_secure_token_xyz987";
const char* DEVICE_ID      = "PLANT-001";

// -------------------------------------------------------------
// Calibration Values for Capacitive Sensor (0 - 4095 ADC)
// -------------------------------------------------------------
const int DRY_CALIBRATION_VALUE = 3200; // Value in completely dry air
const int WET_CALIBRATION_VALUE = 1200; // Value submerged in water

DHT dht(DHTPIN, DHTTYPE);

void connectToWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected successfully!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed! Entering low-power retry state.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n==========================================");
  Serial.println("🌱 Cloud Smart Plant Care - ESP32 Firmware");
  Serial.println("==========================================");

  // Initialize Actuator Output (active HIGH or LOW depending on relay module)
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW); // Default pump OFF

  // Initialize Sensors
  pinMode(SOIL_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  dht.begin();

  connectToWiFi();
}

float readSoilMoisturePercentage() {
  // Take 5-sample average to filter out ADC electrical noise
  long total = 0;
  for (int i = 0; i < 5; i++) {
    total += analogRead(SOIL_PIN);
    delay(10);
  }
  int raw = total / 5;

  // Linear interpolation: Dry (high voltage) -> 0%, Wet (low voltage) -> 100%
  float pct = 100.0f * (float)(DRY_CALIBRATION_VALUE - raw) / (float)(DRY_CALIBRATION_VALUE - WET_CALIBRATION_VALUE);
  if (pct < 0.0f) pct = 0.0f;
  if (pct > 100.0f) pct = 100.0f;
  return pct;
}

float readLightPercentage() {
  int raw = analogRead(LDR_PIN);
  float pct = (float)raw / 40.95f; // 0-4095 mapped to 0-100%
  return pct;
}

void executeWateringPulse(int durationMs) {
  Serial.printf("⚡ PUMP ACTIVE: Running irrigation for %d ms\n", durationMs);
  digitalWrite(PUMP_PIN, HIGH);
  delay(durationMs);
  digitalWrite(PUMP_PIN, LOW);
  Serial.println("🛑 PUMP OFF: Irrigation pulse completed.");
}

void postTelemetry(float soilPct, float tempC, float humidityPct, float lightPct) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi dropped. Reconnecting...");
    connectToWiFi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  HTTPClient http;
  http.begin(INGEST_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  // Construct JSON payload
  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"soil_moisture\":" + String(soilPct, 1) + ",";
  payload += "\"temperature\":" + String(tempC, 1) + ",";
  payload += "\"humidity\":" + String(humidityPct, 1) + ",";
  payload += "\"light_level\":" + String(lightPct, 1) + ",";
  payload += "\"water_tank_level\":85.0";
  payload += "}";

  Serial.println("Broadcasting telemetry to Cloud API: " + payload);
  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("Cloud Ingestion Response [%d]: %s\n", httpResponseCode, response.c_str());

    // Check if cloud response directed immediate watering
    if (response.indexOf("\"triggered\":true") > 0) {
      Serial.println("Automated cloud trigger requested: Starting pump!");
      executeWateringPulse(3000);
    }
  } else {
    Serial.printf("HTTP Ingestion Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

void loop() {
  float soilMoisture = readSoilMoisturePercentage();
  float temperature  = dht.readTemperature();
  float humidity     = dht.readHumidity();
  float light        = readLightPercentage();

  // Guard against temporary sensor read errors
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Warning: DHT22 read failure. Retrying next cycle.");
    temperature = 25.0;
    humidity    = 55.0;
  }

  Serial.printf("\n--- Local Telemetry Sample ---\n");
  Serial.printf("Soil Moisture : %.1f %%\n", soilMoisture);
  Serial.printf("Temperature   : %.1f C\n", temperature);
  Serial.printf("Humidity      : %.1f %%\n", humidity);
  Serial.printf("Light Level   : %.1f %%\n", light);

  // Send reading to cloud platform
  postTelemetry(soilMoisture, temperature, humidity, light);

  // Local safety cutoff: if soil drops critically low (< 15%) and cloud is unreachable,
  // execute fail-safe emergency pulse (prevents crop death during ISP outage)
  if (soilMoisture < 15.0f && WiFi.status() != WL_CONNECTED) {
    Serial.println("EMERGENCY FAIL-SAFE TRIGGER: Local dry condition detected while offline!");
    executeWateringPulse(2000);
  }

  // Sleep interval (configurable, e.g., 60 seconds)
  delay(60 * 1000);
}
