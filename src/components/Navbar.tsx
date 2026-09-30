import React from 'react';
import { Device } from '../types/iot';
import { RefreshCw, Play, Pause, Zap } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  devices: Device[];
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  simulatorActive: boolean;
  onToggleSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  devices,
  selectedDeviceId,
  onSelectDevice,
  onRefresh,
  isRefreshing,
  simulatorActive,
  onToggleSimulator
}) => {
  const selectedDevice = devices.find(d => d.device_id === selectedDeviceId);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3">
          <a
            href="#dashboard"
            onClick={(e) => { e.preventDefault(); setCurrentTab('dashboard'); }}
            className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:text-emerald-400 transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            FloraCloud IoT
          </a>
        </div>

        {/* Zone 2: Navigation Links (Single-line, clean text hover) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'dashboard' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 py-5' : 'text-slate-400'
            }`}
          >
            Telemetry Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('simulator')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'simulator' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 py-5' : 'text-slate-400'
            }`}
          >
            Virtual Simulator
          </button>
          <button
            onClick={() => setCurrentTab('tests')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'tests' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 py-5' : 'text-slate-400'
            }`}
          >
            Verification Suite (25 Tests)
          </button>
          <button
            onClick={() => setCurrentTab('architecture')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'architecture' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 py-5' : 'text-slate-400'
            }`}
          >
            Cloud Architecture
          </button>
          <button
            onClick={() => setCurrentTab('hardware')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'hardware' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 py-5' : 'text-slate-400'
            }`}
          >
            ESP32 Blueprint
          </button>
          <button
            onClick={() => setCurrentTab('report')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'report' ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400 py-5' : 'text-slate-400'
            }`}
          >
            Project Report & Viva
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Device Switcher */}
        <div className="flex items-center gap-3">
          {/* Device Selector */}
          <div className="relative">
            <select
              value={selectedDeviceId}
              onChange={(e) => onSelectDevice(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            >
              {devices.map(dev => (
                <option key={dev.device_id} value={dev.device_id}>
                  {dev.device_id} ({dev.plant_name})
                </option>
              ))}
            </select>
          </div>

          {/* Virtual Ingestion Loop Toggle */}
          <button
            onClick={onToggleSimulator}
            title={simulatorActive ? "Pause Virtual Sensor Stream" : "Start Virtual Sensor Stream"}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              simulatorActive
                ? 'bg-amber-950/70 border border-amber-800 text-amber-300 hover:bg-amber-900/80'
                : 'bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/80'
            }`}
          >
            {simulatorActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{simulatorActive ? 'Live Stream ON' : 'Live Stream OFF'}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Telemetry"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Mobile Nav strip */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-800/80 text-xs no-scrollbar bg-slate-900">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'simulator', label: 'Virtual Simulator' },
          { id: 'tests', label: '25 Test Cases' },
          { id: 'architecture', label: 'Architecture' },
          { id: 'hardware', label: 'ESP32 Blueprint' },
          { id: 'report', label: 'Project Report' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`px-3 py-1.5 rounded whitespace-nowrap font-medium transition-colors ${
              currentTab === item.id ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
