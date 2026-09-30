import React, { useState } from 'react';
import { SensorReading } from '../types/iot';

interface TelemetryChartsProps {
  readings: SensorReading[];
  threshold: number;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ readings, threshold }) => {
  const [activeMetric, setActiveMetric] = useState<'moisture' | 'temperature' | 'humidity' | 'light'>('moisture');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!readings || readings.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
        No historical readings available yet. Trigger sensor readings from the Virtual Simulator.
      </div>
    );
  }

  // Display up to last 40 data points for responsive crispness
  const data = readings.slice(-40);

  const getMetricData = () => {
    switch (activeMetric) {
      case 'moisture':
        return {
          title: 'Soil Moisture Percentage',
          unit: '%',
          values: data.map(d => d.soil_moisture),
          color: '#10b981', // emerald
          fillColor: 'rgba(16, 185, 129, 0.1)',
          min: 0,
          max: 100,
          hasThreshold: true
        };
      case 'temperature':
        return {
          title: 'Ambient Temperature',
          unit: '°C',
          values: data.map(d => d.temperature),
          color: '#f59e0b', // amber
          fillColor: 'rgba(245, 158, 11, 0.1)',
          min: 15,
          max: 42,
          hasThreshold: false
        };
      case 'humidity':
        return {
          title: 'Relative Humidity',
          unit: '%',
          values: data.map(d => d.humidity),
          color: '#06b6d4', // cyan
          fillColor: 'rgba(6, 182, 212, 0.1)',
          min: 20,
          max: 100,
          hasThreshold: false
        };
      case 'light':
        return {
          title: 'Solar Illuminance (Light Level)',
          unit: '%',
          values: data.map(d => d.light_level ?? 50),
          color: '#eab308', // yellow
          fillColor: 'rgba(234, 179, 8, 0.1)',
          min: 0,
          max: 100,
          hasThreshold: false
        };
    }
  };

  const metric = getMetricData();
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 24;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / Math.max(1, data.length - 1)) * chartWidth;
    const val = metric.values[index];
    const normalized = (val - metric.min) / (metric.max - metric.min);
    const clamped = Math.max(0, Math.min(1, normalized));
    const y = paddingY + (1 - clamped) * chartHeight;
    return { x, y, val, time: d.timestamp, reading: d };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0]?.x},${paddingY + chartHeight} ${polylinePoints} ${points[points.length - 1]?.x},${paddingY + chartHeight}`;

  // Threshold Y line
  const thresholdNormalized = (threshold - metric.min) / (metric.max - metric.min);
  const thresholdY = paddingY + (1 - Math.max(0, Math.min(1, thresholdNormalized))) * chartHeight;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      {/* Top Header & Segmented Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Historical Telemetry Streams</span>
            <span className="text-xs text-slate-500 font-mono font-normal">
              · {data.length} data points
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cloud time-series storage partitioned by device ID and UTC timestamp
          </p>
        </div>

        {/* Tabular Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveMetric('moisture')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeMetric === 'moisture'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Soil Moisture
          </button>
          <button
            onClick={() => setActiveMetric('temperature')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeMetric === 'temperature'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setActiveMetric('humidity')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeMetric === 'humidity'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Humidity
          </button>
          <button
            onClick={() => setActiveMetric('light')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeMetric === 'light'
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Light
          </button>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full aspect-[16/7] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id={`grad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metric.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={metric.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + (1 - ratio) * chartHeight;
            const labelVal = Math.round(metric.min + ratio * (metric.max - metric.min));
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {labelVal}{metric.unit}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <polygon points={areaPoints} fill={`url(#grad-${activeMetric})`} />

          {/* Threshold Line (if applicable) */}
          {metric.hasThreshold && (
            <g>
              <line
                x1={paddingX}
                y1={thresholdY}
                x2={width - paddingX}
                y2={thresholdY}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x={width - paddingX - 4}
                y={thresholdY - 5}
                textAnchor="end"
                fill="#f87171"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="500"
              >
                Threshold ({threshold}%)
              </text>
            </g>
          )}

          {/* Trend Polyline */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke={metric.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points / Hover Interactions */}
          {points.map((p, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <g key={index} onMouseEnter={() => setHoveredIndex(index)}>
                {/* Invisible hover capture target */}
                <circle cx={p.x} cy={p.y} r="10" fill="transparent" className="cursor-pointer" />
                {/* Visible dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 2.5}
                  fill={isHovered ? '#ffffff' : metric.color}
                  stroke={metric.color}
                  strokeWidth={isHovered ? '2' : '1'}
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>

        {/* Hovered Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-slate-700/80 px-3 py-1.5 rounded shadow-lg text-xs font-mono pointer-events-none flex items-center gap-3"
          >
            <span className="text-slate-300">
              {new Date(points[hoveredIndex].time).toLocaleTimeString()}
            </span>
            <span className="font-semibold text-white">
              {metric.title}: <span style={{ color: metric.color }}>{points[hoveredIndex].val}{metric.unit}</span>
            </span>
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono mt-3 px-2">
        <span>Earliest: {new Date(data[0]?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="hidden sm:inline">Telemetry sampling rate: ~5s - 60s/cycle</span>
        <span>Latest: {new Date(data[data.length - 1]?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};
