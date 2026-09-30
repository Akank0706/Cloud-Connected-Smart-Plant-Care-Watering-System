import React, { useState } from 'react';
import { Cpu, Zap, ShieldAlert, Copy, Check, ExternalLink } from 'lucide-react';

export const HardwareEsp32Guide: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedWiring, setCopiedWiring] = useState<boolean>(false);

  const wiringText = `
ESP32 Pinout & Sensor Wiring Scheme:
======================================================
1. Capacitive Soil Moisture Sensor v1.2:
   - VCC  ---> ESP32 3V3 (or regulated 3.3V rail)
   - GND  ---> ESP32 GND
   - AOUT ---> ESP32 GPIO 34 (ADC1_CH6 - Low noise analog input)

2. DHT22 Temperature & Humidity Sensor:
   - VCC  ---> ESP32 3V3
   - GND  ---> ESP32 GND
   - DATA ---> ESP32 GPIO 4 (Add 10kΩ pull-up resistor to 3V3)

3. 5V Relay Module for 5V-12V DC Mini Water Pump:
   - IN   ---> ESP32 GPIO 26
   - VCC  ---> 5V External Power Supply (NOT 3V3!)
   - GND  ---> Common GND (Tie ESP32 GND and Pump GND together!)

4. Pump Power Circuit:
   - Power (+) ---> [Relay COM Terminal]
   - [Relay NO Terminal] ---> Water Pump (+)
   - Water Pump (-) ---> External Power Supply GND
   *(Safety: Place 1N4007 flyback diode across pump terminals)*
======================================================
`;

  const esp32SampleCode = `#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

#define SOIL_PIN 34
#define DHTPIN 4
#define DHTTYPE DHT22
#define PUMP_PIN 26

const char* ssid = "YOUR_WIFI_SSID";
const char* pass = "YOUR_WIFI_PASSWORD";
const char* INGEST_URL = "https://your-cloud-run-service.app/api/sensors/data";
const char* API_KEY = "plant_secure_token_xyz987";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW); // Pump OFF by default
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
  dht.begin();
}

float readSoilMoisture() {
  int raw = analogRead(SOIL_PIN); // 0 - 4095
  int DRY = 3200, WET = 1200; // Calibrate in air vs water
  float pct = 100.0f * (float)(DRY - raw) / (float)(DRY - WET);
  return constrain(pct, 0.0f, 100.0f);
}

void loop() {
  float soil = readSoilMoisture();
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(INGEST_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", API_KEY);

    String payload = "{\\"device_id\\":\\"PLANT-001\\",\\"soil_moisture\\":" + String(soil, 1) +
                     ",\\"temperature\\":" + String(temp, 1) +
                     ",\\"humidity\\":" + String(hum, 1) + "}";

    int code = http.POST(payload);
    String response = http.getString();
    http.end();

    // Check if cloud commanded pump trigger
    if (response.indexOf("\\"triggered\\":true") > 0) {
      Serial.println("Cloud ordered watering: Running pump for 3s");
      digitalWrite(PUMP_PIN, HIGH);
      delay(3000);
      digitalWrite(PUMP_PIN, LOW);
    }
  }
  delay(60 * 1000); // 1-minute cycle
}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Physical ESP32 & Sensors Hardware Blueprint
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production wiring schematic, safe low-voltage design, and drop-in Arduino C++ firmware
            </p>
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 font-semibold">Laboratory Safety Protocol: </strong>
          Strictly utilize low-voltage DC submersible pumps (5V to 12V DC). Never connect 110V/220V AC mains electricity into student breadboards. Always tie grounds together (Common GND) and place a reverse-biased flyback diode (e.g. 1N4007) across inductive DC motor terminals to suppress back-EMF voltage spikes that could reset the ESP32.
        </div>
      </div>

      {/* Two-Column Grid: Bill of Materials & Pinout Wiring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bill of Materials (BOM) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Bill of Materials (BOM)</span>
          </h3>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <div className="font-semibold text-white">ESP32-WROOM-32 Development Board</div>
              <div className="text-slate-400 mt-0.5">Dual-core 240MHz MCU with 2.4GHz Wi-Fi 802.11 b/g/n & BLE. Serves as edge compute node.</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <div className="font-semibold text-white">Capacitive Soil Moisture Sensor v1.2</div>
              <div className="text-slate-400 mt-0.5">Immune to electrochemical galvanic corrosion compared to resistive sensor forks. Analog output 0-3.3V.</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <div className="font-semibold text-white">DHT22 (AM2302) Ambient Sensor</div>
              <div className="text-slate-400 mt-0.5">Accurate ambient temperature (±0.5°C) and relative humidity (±2%) single-bus digital probe.</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <div className="font-semibold text-white">5V 1-Channel Relay Module / N-Channel MOSFET</div>
              <div className="text-slate-400 mt-0.5">Optocoupler-isolated relay module switching 5V-12V DC power to the water pump.</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <div className="font-semibold text-white">Submersible Mini DC Water Pump & Silicone Tubing</div>
              <div className="text-slate-400 mt-0.5">1.2–2.0 L/min flow rate at 5V DC. Infuses water directly to plant root zone.</div>
            </div>
          </div>
        </div>

        {/* Wiring ASCII Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-semibold text-white">
                Hardware Schematic & Pin Mapping
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(wiringText);
                  setCopiedWiring(true);
                  setTimeout(() => setCopiedWiring(false), 2000);
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                {copiedWiring ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Wiring</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
              {wiringText.trim()}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <strong>Calibration Tip:</strong> Capacitive sensor readings vary with soil soil density. Measure ADC value in dry air (typically ~3200) and in cup of water (typically ~1200) to calibrate percentage mapping.
          </div>
        </div>

      </div>

      {/* Embedded Arduino Firmware Code Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white font-mono">
              firmware/esp32_plant_monitor.ino
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Production-ready Arduino C++ code matching the cloud REST API contract
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(esp32SampleCode);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors border border-slate-700"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Firmware Code'}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed">
          {esp32SampleCode}
        </pre>
      </div>
    </div>
  );
};
