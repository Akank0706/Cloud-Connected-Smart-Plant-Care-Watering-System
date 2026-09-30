import React, { useState, useEffect, useRef } from 'react';
import { Device, SensorReading } from '../types/iot';
import { Play, Pause, FastForward, RotateCcw, Flame, Droplets, WifiOff, Terminal, Copy, Check } from 'lucide-react';

interface VirtualSimulatorStudioProps {
  device: Device;
  onSendTelemetry: (reading: Partial<SensorReading>) => Promise<any>;
  isActive: boolean;
  onToggleActive: () => void;
}

export const VirtualSimulatorStudio: React.FC<VirtualSimulatorStudioProps> = ({
  device,
  onSendTelemetry,
  isActive,
  onToggleActive
}) => {
  // Virtual physical state
  const [soilMoisture, setSoilMoisture] = useState<number>(38.5);
  const [temperature, setTemperature] = useState<number>(27.5);
  const [humidity, setHumidity] = useState<number>(62.0);
  const [lightLevel, setLightLevel] = useState<number>(75.0);
  const [waterTankLevel, setWaterTankLevel] = useState<number>(85.0);
  const [tickInterval, setTickInterval] = useState<number>(5);
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'warn' | 'success' | 'err' }>>([
    {
      time: new Date().toLocaleTimeString(),
      msg: `Virtual node initialized for ${device.device_id} (${device.plant_name}). Ready for telemetry transmission.`,
      type: 'info'
    }
  ]);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [isWateringPulseActive, setIsWateringPulseActive] = useState<boolean>(false);
  const wateringTicksRef = useRef<number>(0);

  const addLog = (msg: string, type: 'info' | 'warn' | 'success' | 'err' = 'info') => {
    setLogs(prev => [
      { time: new Date().toLocaleTimeString(), msg, type },
      ...prev.slice(0, 40)
    ]);
  };

  // Simulation Step Function
  const stepSimulation = async () => {
    let nextSoil = soilMoisture;
    let nextTank = waterTankLevel;

    if (isWateringPulseActive && wateringTicksRef.current > 0) {
      // Rebound moisture after irrigation pulse
      nextSoil = Math.min(85, nextSoil + 7.5);
      nextTank = Math.max(5, nextTank - 1.5);
      wateringTicksRef.current -= 1;
      addLog(`💦 Irrigation Infusion: Soil moisture increased to ${nextSoil.toFixed(1)}%`, 'success');
      if (wateringTicksRef.current <= 0) {
        setIsWateringPulseActive(false);
        addLog('🛑 Irrigation pulse completed. Soil moisture stabilized.', 'info');
      }
    } else {
      // Natural soil drying through transpiration
      const decay = 0.6 + (temperature - 20) * 0.02;
      nextSoil = Math.max(8, Number((nextSoil - decay).toFixed(1)));
    }

    // Diurnal variation for temperature, humidity, and light
    const nextTemp = Number((24 + Math.sin(Date.now() / 30000) * 5 + (Math.random() - 0.5) * 0.4).toFixed(1));
    const nextHum = Math.round(62 - (nextTemp - 24) * 1.5 + (Math.random() - 0.5) * 2);
    const nextLight = Math.round(Math.max(10, Math.min(95, 50 + Math.sin(Date.now() / 25000) * 40)));

    setSoilMoisture(nextSoil);
    setTemperature(nextTemp);
    setHumidity(nextHum);
    setLightLevel(nextLight);
    setWaterTankLevel(nextTank);

    const payload = {
      device_id: device.device_id,
      soil_moisture: nextSoil,
      temperature: nextTemp,
      humidity: nextHum,
      light_level: nextLight,
      water_tank_level: nextTank,
      timestamp: new Date().toISOString()
    };

    try {
      const resp = await onSendTelemetry(payload);
      addLog(
        `POST /api/sensors/data [201 Created] · Soil: ${nextSoil}% | Temp: ${nextTemp}°C | Tank: ${nextTank}%`,
        'info'
      );

      // Inspect automation decision
      if (resp?.automation?.triggered) {
        addLog(
          `⚡ DIRECTIVE: ${resp.automation.reason}`,
          'warn'
        );
        setIsWateringPulseActive(true);
        wateringTicksRef.current = 4;
      }
    } catch (err: any) {
      addLog(`HTTP Ingestion Error: ${err.message || 'Connection failure'}`, 'err');
    }
  };

  // Interval loop when isActive is true
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(stepSimulation, tickInterval * 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, tickInterval, soilMoisture, waterTankLevel, temperature, isWateringPulseActive, device.device_id]);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("python3 sensor_simulator/simulator.py");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Virtual IoT Hardware Simulator Studio
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Enables 100% hardware-independent testing and demonstration. Generates realistic, non-random botanical physics: transpiration-driven moisture decay, solar thermal fluctuations, and automated irrigation reactions.
            </p>
          </div>

          {/* Quick Terminal Command */}
          <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <code className="text-xs font-mono text-slate-300">
              python3 sensor_simulator/simulator.py
            </code>
            <button
              onClick={handleCopyCmd}
              title="Copy Terminal Command"
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Virtual Microclimate Controller */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
              <span className="text-sm font-semibold text-slate-200">
                Virtual Node State: <span className="font-mono text-emerald-400">{device.device_id}</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">Interval:</span>
                <select
                  value={tickInterval}
                  onChange={(e) => setTickInterval(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={2}>2 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                </select>
              </div>
            </div>

            {/* Simulated Value Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              
              {/* Soil Moisture */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Virtual Soil Moisture</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{soilMoisture}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  step="0.5"
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>Dry (&lt;20%)</span>
                  <span>Threshold ({device.moisture_threshold}%)</span>
                  <span>Saturated (&gt;75%)</span>
                </div>
              </div>

              {/* Water Reservoir */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Water Reservoir Gauge</span>
                  <span className="text-sm font-bold font-mono text-blue-400">{waterTankLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={waterTankLevel}
                  onChange={(e) => setWaterTankLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>Cutoff (&lt;15%)</span>
                  <span>Optimal</span>
                  <span>Full (100%)</span>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Simulated Temperature</span>
                  <span className="text-sm font-bold font-mono text-amber-400">{temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>15°C (Cool)</span>
                  <span>Ceiling: 36°C</span>
                  <span>45°C (Extreme)</span>
                </div>
              </div>

              {/* Relative Humidity */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Relative Humidity</span>
                  <span className="text-sm font-bold font-mono text-cyan-400">{humidity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  step="1"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>20% (Arid)</span>
                  <span>60% (Comfort)</span>
                  <span>95% (Misty)</span>
                </div>
              </div>

            </div>

            {/* Test Case Trigger Buttons (Fast scenarios for presentation/viva) */}
            <div className="mb-4">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2.5">
                One-Click Viva & Test Scenario Triggers
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSoilMoisture(25.0);
                    addLog('Scenario triggered: Soil dried down to 25% (below threshold).', 'warn');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-amber-300 font-medium transition-colors"
                >
                  <Droplets className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dry Spell (25%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTemperature(38.5);
                    addLog('Scenario triggered: Heat wave simulated at 38.5°C.', 'warn');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-rose-300 font-medium transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Heat Wave (38.5°C)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWaterTankLevel(8.0);
                    addLog('Scenario triggered: Water reservoir depleted to 8% (below safety cutoff).', 'err');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-rose-300 font-medium transition-colors"
                >
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Tank Empty (8%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWaterTankLevel(100.0);
                    setSoilMoisture(55.0);
                    setTemperature(25.0);
                    addLog('Scenario reset: Conditions restored to nominal baseline.', 'info');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-emerald-300 font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reset Nominal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Execution Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onToggleActive}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${
                  isActive
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isActive ? 'Pause Automatic Ticks' : 'Start Continuous Simulation'}</span>
              </button>

              <button
                type="button"
                onClick={stepSimulation}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                <FastForward className="w-3.5 h-3.5 text-blue-400" />
                <span>Single Tick (1 Ingest)</span>
              </button>
            </div>

            <span className="text-xs text-slate-500 font-mono">
              Status: {isActive ? 'Streaming Active' : 'Standby / Manual'}
            </span>
          </div>
        </div>

        {/* Column 3: Live Output Terminal & Packet Logs */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulator Packet Log</span>
            </span>
            <span className="text-[10px] text-slate-500">Live Stream</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px] pr-1">
            {logs.map((l, i) => (
              <div key={i} className="leading-snug break-words">
                <span className="text-slate-600 text-[10px]">[{l.time}] </span>
                <span
                  className={
                    l.type === 'err'
                      ? 'text-rose-400'
                      : l.type === 'warn'
                      ? 'text-amber-400'
                      : l.type === 'success'
                      ? 'text-emerald-300 font-semibold'
                      : 'text-slate-300'
                  }
                >
                  {l.msg}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] text-slate-500">
            Encapsulating JSON payload over HTTPS with x-api-key authentication.
          </div>
        </div>

      </div>
    </div>
  );
};
