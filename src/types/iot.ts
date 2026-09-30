export interface SensorReading {
  reading_id: string;
  device_id: string;
  soil_moisture: number; // 0 - 100%
  temperature: number;   // °C
  humidity: number;      // %
  light_level?: number;  // 0 - 100%
  water_tank_level?: number; // 0 - 100%
  timestamp: string;     // ISO String
}

export interface Device {
  device_id: string;
  user_id: string;
  plant_name: string;
  plant_type: 'Tomato' | 'Succulent' | 'Herb' | 'Indoor Plant' | 'Custom';
  location: string;
  moisture_threshold: number; // e.g. 30%
  auto_water_enabled: boolean;
  pump_status: 'OFF' | 'ON';
  last_seen: string;
  created_at: string;
  api_key_hash?: string;
  min_tank_threshold?: number;
  cooldown_seconds?: number;
  last_watered_at?: string;
  status?: 'ONLINE' | 'OFFLINE';
}

export interface WateringEvent {
  event_id: string;
  device_id: string;
  trigger_type: 'automatic' | 'manual';
  moisture_before: number;
  moisture_after?: number;
  duration_ms: number;
  timestamp: string;
  water_consumed_ml?: number;
  reason?: string;
}

export interface AlertItem {
  alert_id: string;
  device_id: string;
  alert_type: 'LOW_SOIL_MOISTURE' | 'HIGH_TEMPERATURE' | 'LOW_WATER_TANK' | 'DEVICE_OFFLINE';
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  created_at: string;
  resolved_at?: string;
}

export interface AnalyticsSummary {
  avg_soil_moisture: number;
  min_soil_moisture: number;
  max_soil_moisture: number;
  avg_temperature: number;
  avg_humidity: number;
  total_watering_events: number;
  daily_watering_frequency: number;
  total_water_consumed_liters: number;
  plant_health_status: 'Optimal' | 'Needs Water' | 'Critical Heat' | 'Reservoir Empty';
  device_uptime_percentage: number;
}

export interface TestCaseResult {
  test_id: number;
  scenario: string;
  input: string;
  expected_result: string;
  actual_result: string;
  status: 'PASS' | 'FAIL';
  execution_ms: number;
}
