import React from 'react';
import { WateringEvent } from '../types/iot';
import { History, CheckCircle2 } from 'lucide-react';

interface WateringHistoryTableProps {
  events: WateringEvent[];
}

export const WateringHistoryTable: React.FC<WateringHistoryTableProps> = ({ events }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Irrigation Event Audit Log</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable cloud records of automated threshold and manual actuator executions
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {events.length} records logged
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-medium border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-normal">Timestamp</th>
              <th className="py-2.5 px-4 font-normal">Trigger Type</th>
              <th className="py-2.5 px-4 font-normal text-right">Moisture Δ</th>
              <th className="py-2.5 px-4 font-normal text-right">Duration</th>
              <th className="py-2.5 px-4 font-normal text-right">Volume</th>
              <th className="py-2.5 px-4 font-normal">Execution Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                  No watering events recorded for this device yet.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.event_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4 font-sans whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        event.trigger_type === 'automatic'
                          ? 'text-emerald-400'
                          : 'text-blue-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {event.trigger_type === 'automatic' ? 'Autonomous Cloud' : 'Manual Dashboard'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums whitespace-nowrap text-slate-200">
                    <span className="text-amber-400">{event.moisture_before}%</span>
                    <span className="text-slate-500 mx-1">→</span>
                    <span className="text-emerald-400">{event.moisture_after ?? event.moisture_before + 25}%</span>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-slate-300 whitespace-nowrap">
                    {(event.duration_ms / 1000).toFixed(1)}s
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-slate-300 whitespace-nowrap">
                    {event.water_consumed_ml ?? 60} mL
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 max-w-xs truncate" title={event.reason}>
                    {event.reason || 'Threshold-triggered irrigation pulse'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
