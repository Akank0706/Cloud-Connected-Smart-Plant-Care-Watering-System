import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  status?: 'nominal' | 'warning' | 'critical' | 'neutral';
  meta?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  status = 'neutral',
  meta
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'nominal':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'critical':
        return 'text-rose-400';
      default:
        return 'text-slate-100';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'warning':
        return 'border-amber-500/30';
      case 'critical':
        return 'border-rose-500/30';
      default:
        return 'border-slate-800';
    }
  };

  return (
    <div className={`p-4 bg-slate-900 rounded-xl border ${getBorderColor()} transition-colors hover:border-slate-700/80`}>
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-medium tracking-wide uppercase">{label}</span>
        {meta && <span className="font-mono text-slate-500">{meta}</span>}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${getStatusColor()}`}>
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-400 font-sans">{unit}</span>}
      </div>

      {subtext && (
        <div className="text-xs text-slate-400 mt-2 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
