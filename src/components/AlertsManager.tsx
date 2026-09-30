import React from 'react';
import { AlertItem } from '../types/iot';
import { AlertTriangle, AlertCircle, Info, Check, BellRing } from 'lucide-react';

interface AlertsManagerProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (alertId: string) => Promise<void>;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  onAcknowledgeAlert
}) => {
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const acknowledgedAlerts = alerts.filter(a => a.status !== 'ACTIVE');

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-rose-400 font-semibold';
      case 'WARNING':
        return 'text-amber-400 font-semibold';
      default:
        return 'text-blue-400 font-medium';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>Alerts & Telemetry Incident Hub</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time notifications for threshold violations and offline heartbeats
          </p>
        </div>
        <div className="text-xs font-mono">
          <span className="text-amber-400 font-bold">{activeAlerts.length} Active</span>
          <span className="text-slate-600 mx-1.5">·</span>
          <span className="text-slate-400">{alerts.length} Total</span>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-2.5 mb-6">
        {activeAlerts.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-lg border border-slate-800/60">
            <span className="text-emerald-400 font-medium">All systems nominal</span> — No active threshold alerts or offline incidents.
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="flex items-start justify-between gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                {getSeverityIcon(alert.severity)}
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-mono text-[11px] ${getSeverityBadge(alert.severity)}`}>
                      [{alert.severity}]
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {alert.device_id}
                    </span>
                    <span className="text-slate-600 text-[10px]">·</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 font-sans leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAcknowledgeAlert(alert.alert_id)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded transition-colors border border-slate-700"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Ack</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Acknowledged / Resolved History */}
      {acknowledgedAlerts.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Recent Resolved / Acknowledged Incidents
          </h4>
          <div className="space-y-1.5 opacity-75">
            {acknowledgedAlerts.slice(0, 4).map((a) => (
              <div
                key={a.alert_id}
                className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-950/50 rounded border border-slate-800/50 text-slate-400 font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-500">[{a.status}]</span>
                  <span className="text-slate-300 font-sans truncate">{a.message}</span>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 ml-2">
                  {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enterprise Notification Architecture Note */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-400">Push Notification Integration:</span> In enterprise cloud deployments, critical alerts trigger AWS SNS / Firebase Cloud Messaging (FCM) push notifications directly to greenhouse operators' mobile devices.
      </div>
    </div>
  );
};
