import React, { useState } from 'react';
import { Device } from '../types/iot';
import { Droplet, Power, Sliders, ShieldCheck } from 'lucide-react';

interface WateringControlPanelProps {
  device: Device;
  onUpdateThreshold: (threshold: number, plantType: string, autoEnabled: boolean) => Promise<void>;
  onTriggerWater: (durationMs: number) => Promise<void>;
  isWatering: boolean;
}

const PLANT_PROFILES = [
  {
    type: 'Succulent',
    threshold: 20,
    desc: 'Low water requirement. Needs dry soil periods to avoid root rot.'
  },
  {
    type: 'Indoor Plant',
    threshold: 30,
    desc: 'Moderate hydration. Thrives in stable, non-soggy potting soil.'
  },
  {
    type: 'Herb',
    threshold: 35,
    desc: 'Shallow root system requiring steady, even moisture for vibrant foliage.'
  },
  {
    type: 'Tomato',
    threshold: 40,
    desc: 'High transpiration rate during fruit growth; prevents blossom-end rot.'
  }
];

export const WateringControlPanel: React.FC<WateringControlPanelProps> = ({
  device,
  onUpdateThreshold,
  onTriggerWater,
  isWatering
}) => {
  const [threshold, setThreshold] = useState<number>(device.moisture_threshold);
  const [autoEnabled, setAutoEnabled] = useState<boolean>(device.auto_water_enabled);
  const [selectedProfile, setSelectedProfile] = useState<string>(device.plant_type);
  const [durationMs, setDurationMs] = useState<number>(3000);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const handleProfileSelect = (type: string, th: number) => {
    setSelectedProfile(type);
    setThreshold(th);
  };

  const handleSaveThreshold = async () => {
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      await onUpdateThreshold(threshold, selectedProfile, autoEnabled);
      setSaveFeedback('Threshold updated');
      setTimeout(() => setSaveFeedback(null), 3000);
    } catch (err) {
      setSaveFeedback('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAuto = async () => {
    const nextVal = !autoEnabled;
    setAutoEnabled(nextVal);
    await onUpdateThreshold(threshold, selectedProfile, nextVal);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Irrigation Control & Safety Logic</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Closed-loop decision engine with anti-saturation cooldown
            </p>
          </div>

          {/* Actuator State Indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                device.pump_status === 'ON' || isWatering
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-mono font-medium text-slate-300">
              Pump: {device.pump_status === 'ON' || isWatering ? 'RUNNING' : 'IDLE'}
            </span>
          </div>
        </div>

        {/* Plant Profiles Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
            Plant Profile Preset
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PLANT_PROFILES.map((p) => {
              const isSelected = selectedProfile === p.type;
              return (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => handleProfileSelect(p.type, p.threshold)}
                  className={`px-3 py-2 text-left rounded-lg border text-xs transition-colors ${
                    isSelected
                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-white">{p.type}</div>
                  <div className="font-mono text-emerald-400 text-xs mt-0.5">Target: {p.threshold}%</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Moisture Threshold Slider */}
        <div className="mb-5 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">
              Moisture Trigger Threshold
            </span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {threshold}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            step="1"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1.5">
            <span>10% (Dry Arid)</span>
            <span>40% (Temperate)</span>
            <span>80% (Tropical Wetland)</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleAuto}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs text-slate-300">
                Autonomous Cloud Irrigation
              </span>
            </div>

            <div className="flex items-center gap-2">
              {saveFeedback && (
                <span className="text-xs text-emerald-400 font-medium">
                  {saveFeedback}
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveThreshold}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Updating...' : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Actuator Trigger Section */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Duration:</span>
            {[2000, 3000, 5000].map((ms) => (
              <button
                key={ms}
                onClick={() => setDurationMs(ms)}
                className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                  durationMs === ms
                    ? 'bg-slate-800 text-white border-slate-600'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onTriggerWater(durationMs)}
            disabled={isWatering || device.pump_status === 'ON'}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Droplet className={`w-3.5 h-3.5 ${isWatering ? 'animate-bounce' : ''}`} />
            <span>
              {isWatering || device.pump_status === 'ON' ? 'Watering Active...' : 'Manual Water Override'}
            </span>
          </button>
        </div>

        {/* Safety Protection Note */}
        <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500 font-sans">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Cooldown safeguard: Minimum 180s interval enforced between automated pulses.</span>
        </div>
      </div>
    </div>
  );
};
