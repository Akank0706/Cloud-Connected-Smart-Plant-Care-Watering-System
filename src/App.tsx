import React, { useState, useEffect, useCallback } from 'react';
import { Device, SensorReading, WateringEvent, AlertItem, AnalyticsSummary } from './types/iot';
import { Navbar } from './components/Navbar';
import { MetricCard } from './components/MetricCard';
import { TelemetryCharts } from './components/TelemetryCharts';
import { WateringControlPanel } from './components/WateringControlPanel';
import { WateringHistoryTable } from './components/WateringHistoryTable';
import { AlertsManager } from './components/AlertsManager';
import { VirtualSimulatorStudio } from './components/VirtualSimulatorStudio';
import { CloudTestRunner } from './components/CloudTestRunner';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { HardwareEsp32Guide } from './components/HardwareEsp32Guide';
import { ProjectReportViewer } from './components/ProjectReportViewer';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('PLANT-001');
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [readingsHistory, setReadingsHistory] = useState<SensorReading[]>([]);
  const [wateringEvents, setWateringEvents] = useState<WateringEvent[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [simulatorActive, setSimulatorActive] = useState<boolean>(false);
  const [isWateringPulse, setIsWateringPulse] = useState<boolean>(false);

  // Fetch all dashboard data
  const fetchData = useCallback(async () => {
    try {
      // 1. Devices
      const devRes = await fetch('/api/devices');
      if (devRes.ok) {
        const devData: Device[] = await devRes.json();
        setDevices(devData);
      }

      // 2. Latest Reading for selected device
      const latestRes = await fetch(`/api/devices/${selectedDeviceId}/latest`);
      if (latestRes.ok) {
        const latestData = await latestRes.json();
        setLatestReading(latestData);
      }

      // 3. History for selected device
      const histRes = await fetch(`/api/devices/${selectedDeviceId}/history?limit=50`);
      if (histRes.ok) {
        const histData = await histRes.json();
        setReadingsHistory(histData);
      }

      // 4. Watering Events for selected device
      const waterRes = await fetch(`/api/devices/${selectedDeviceId}/watering-history`);
      if (waterRes.ok) {
        const waterData = await waterRes.json();
        setWateringEvents(waterData);
      }

      // 5. System Alerts
      const alertsRes = await fetch('/api/alerts');
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      // 6. Analytics
      const analyticsRes = await fetch(`/api/analytics?device_id=${selectedDeviceId}`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error('Failed to fetch telemetry data:', err);
    }
  }, [selectedDeviceId]);

  // Periodic polling every 4 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleUpdateThreshold = async (
    threshold: number,
    plantType: string,
    autoEnabled: boolean
  ) => {
    try {
      const res = await fetch(`/api/devices/${selectedDeviceId}/threshold`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moisture_threshold: threshold,
          plant_type: plantType,
          auto_water_enabled: autoEnabled
        })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update threshold:', err);
    }
  };

  const handleTriggerWater = async (durationMs: number) => {
    setIsWateringPulse(true);
    try {
      const res = await fetch(`/api/devices/${selectedDeviceId}/water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_ms: durationMs })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to trigger watering:', err);
    } finally {
      setTimeout(() => setIsWateringPulse(false), durationMs);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'PUT'
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleSendTelemetry = async (payload: Partial<SensorReading>) => {
    const res = await fetch('/api/sensors/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'plant_secure_token_xyz987'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Ingestion failed with HTTP ${res.status}`);
    }
    const data = await res.json();
    await fetchData();
    return data;
  };

  const handleRunTestSuite = async () => {
    const res = await fetch('/api/test-suite/run');
    if (!res.ok) {
      throw new Error(`Test suite failed with HTTP ${res.status}`);
    }
    return await res.json();
  };

  const selectedDevice = devices.find(d => d.device_id === selectedDeviceId) || devices[0];

  const getMoistureStatus = (soil: number, th: number) => {
    if (soil < th) return 'warning';
    if (soil > 85) return 'critical';
    return 'nominal';
  };

  const getTempStatus = (temp: number) => {
    if (temp > 36) return 'critical';
    if (temp > 32) return 'warning';
    return 'nominal';
  };

  const getTankStatus = (tank: number) => {
    if (tank < 15) return 'critical';
    if (tank < 30) return 'warning';
    return 'nominal';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={(id) => setSelectedDeviceId(id)}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        simulatorActive={simulatorActive}
        onToggleSimulator={() => setSimulatorActive(!simulatorActive)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: TELEMETRY DASHBOARD */}
        {currentTab === 'dashboard' && selectedDevice && (
          <div className="space-y-6">
            
            {/* Device Breadcrumb & Identity Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>Farm / Zone 1</span>
                  <span>/</span>
                  <span className="text-slate-300">{selectedDevice.location}</span>
                  <span>/</span>
                  <span className="text-emerald-400 font-semibold">{selectedDevice.device_id}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                  <span>{selectedDevice.plant_name}</span>
                  <span className="text-xs font-normal font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                    {selectedDevice.plant_type} Profile
                  </span>
                </h1>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedDevice.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span className={selectedDevice.status === 'ONLINE' ? 'text-emerald-300' : 'text-rose-400'}>
                    Node: {selectedDevice.status}
                  </span>
                </div>
                <div className="text-slate-400">
                  Threshold: <span className="text-white font-bold">{selectedDevice.moisture_threshold}%</span>
                </div>
                <div className="text-slate-500 hidden md:inline">
                  Last seen: {new Date(selectedDevice.last_seen).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Offline Alert Warning Banner (if device offline) */}
            {selectedDevice.status === 'OFFLINE' && (
              <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <div className="text-xs text-rose-200">
                  <strong>Warning: Device Heartbeat Lost. </strong>
                  No telemetry has been received from {selectedDevice.device_id} for over 180 seconds. Check Wi-Fi connection, edge power supply, or start the Virtual Simulator to restore heartbeat.
                </div>
              </div>
            )}

            {/* Metric Cards Grid (Section 11) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <MetricCard
                label="Soil Moisture"
                value={latestReading ? latestReading.soil_moisture : 32}
                unit="%"
                status={
                  latestReading
                    ? getMoistureStatus(latestReading.soil_moisture, selectedDevice.moisture_threshold)
                    : 'nominal'
                }
                subtext={`Target: ${selectedDevice.moisture_threshold}%`}
                meta={latestReading && latestReading.soil_moisture < selectedDevice.moisture_threshold ? 'DRY' : 'OK'}
              />

              <MetricCard
                label="Temperature"
                value={latestReading ? latestReading.temperature : 29.4}
                unit="°C"
                status={latestReading ? getTempStatus(latestReading.temperature) : 'nominal'}
                subtext="Ceiling: 36.0°C"
                meta="Ambient"
              />

              <MetricCard
                label="Air Humidity"
                value={latestReading ? latestReading.humidity : 61}
                unit="%"
                status="nominal"
                subtext="Range: 40-70%"
                meta="DHT22"
              />

              <MetricCard
                label="Solar Light"
                value={latestReading ? (latestReading.light_level ?? 72) : 72}
                unit="%"
                status="nominal"
                subtext="Photosynthesis"
                meta="Lux"
              />

              <MetricCard
                label="Reservoir Tank"
                value={latestReading ? (latestReading.water_tank_level ?? 85) : 85}
                unit="%"
                status={latestReading ? getTankStatus(latestReading.water_tank_level ?? 85) : 'nominal'}
                subtext="Cutoff: 15%"
                meta="Safety"
              />

              <MetricCard
                label="Pump Status"
                value={selectedDevice.pump_status === 'ON' || isWateringPulse ? 'ON' : 'OFF'}
                status={selectedDevice.pump_status === 'ON' || isWateringPulse ? 'nominal' : 'neutral'}
                subtext={selectedDevice.auto_water_enabled ? 'Auto-Irrigate: ON' : 'Auto-Irrigate: OFF'}
                meta="Actuator"
              />
            </div>

            {/* Real-time Telemetry Charts */}
            <TelemetryCharts
              readings={readingsHistory}
              threshold={selectedDevice.moisture_threshold}
            />

            {/* Split Section: Control Panel & Incident Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WateringControlPanel
                device={selectedDevice}
                onUpdateThreshold={handleUpdateThreshold}
                onTriggerWater={handleTriggerWater}
                isWatering={isWateringPulse}
              />

              <AlertsManager
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            </div>

            {/* Historical Watering Events Table */}
            <WateringHistoryTable events={wateringEvents} />

            {/* Agricultural Analytics Summary Strip (Section 23) */}
            {analytics && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Agronomic Health & Resource Analytics</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-500">
                    Continuous 24-Hour Rollup
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[11px]">Avg Soil Moisture</div>
                    <div className="text-lg font-bold text-white mt-1">{analytics.avg_soil_moisture}%</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[11px]">Min / Max Moisture</div>
                    <div className="text-lg font-bold text-slate-200 mt-1">
                      {analytics.min_soil_moisture}% <span className="text-slate-500 text-xs">/</span> {analytics.max_soil_moisture}%
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[11px]">Avg Temperature</div>
                    <div className="text-lg font-bold text-amber-300 mt-1">{analytics.avg_temperature}°C</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[11px]">Irrigation Events</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">{analytics.total_watering_events} pulses</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[11px]">Estimated Water Used</div>
                    <div className="text-lg font-bold text-blue-400 mt-1">{analytics.total_water_consumed_liters} Liters</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[11px]">Device Uptime</div>
                    <div className="text-lg font-bold text-emerald-300 mt-1">{analytics.device_uptime_percentage}%</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: VIRTUAL SENSOR SIMULATOR STUDIO */}
        {currentTab === 'simulator' && selectedDevice && (
          <VirtualSimulatorStudio
            device={selectedDevice}
            onSendTelemetry={handleSendTelemetry}
            isActive={simulatorActive}
            onToggleActive={() => setSimulatorActive(!simulatorActive)}
          />
        )}

        {/* TAB 3: 25-CASE AUTOMATED VERIFICATION TEST SUITE */}
        {currentTab === 'tests' && (
          <CloudTestRunner onRunTestSuite={handleRunTestSuite} />
        )}

        {/* TAB 4: CLOUD ARCHITECTURE & CONCEPTS */}
        {currentTab === 'architecture' && (
          <ArchitectureViewer />
        )}

        {/* TAB 5: PHYSICAL ESP32 BLUEPRINT & CODE */}
        {currentTab === 'hardware' && (
          <HardwareEsp32Guide />
        )}

        {/* TAB 6: ACADEMIC REPORT & INTERVIEW PREP */}
        {currentTab === 'report' && (
          <ProjectReportViewer />
        )}

      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Cloud-Connected Smart Plant Care &amp; Watering System · Academic Proof of Work
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-sans">
            <span>REST API Active</span>
            <span>·</span>
            <span>Hardware-Independent Python Simulator</span>
            <span>·</span>
            <span>ESP32 Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
