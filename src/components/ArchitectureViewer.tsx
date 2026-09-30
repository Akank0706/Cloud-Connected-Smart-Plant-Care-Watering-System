import React, { useState } from 'react';
import { Layers, Cloud, Server, Shield, Network, ArrowRight } from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const [activeArch, setActiveArch] = useState<'student' | 'enterprise'>('student');

  const cloudConcepts = [
    {
      term: 'Cloud Computing',
      category: 'Foundation',
      explanation: 'On-demand delivery of compute power, storage, and automated irrigation logic via the internet, decoupling physical agricultural sensors from local hardware constraints.'
    },
    {
      term: 'IoT-to-Cloud Architecture',
      category: 'Networking',
      explanation: 'Hierarchical bridge connecting edge nodes (ESP32 or Python simulator) over HTTPS/MQTT to cloud ingestion gateways, persistence layers, and monitoring dashboards.'
    },
    {
      term: 'SaaS (Software as a Service)',
      category: 'Service Model',
      explanation: 'The turnkey React dashboard enabling plant owners and agronomists to configure plant profiles, monitor telemetry, and trigger irrigation without managing servers.'
    },
    {
      term: 'PaaS (Platform as a Service)',
      category: 'Service Model',
      explanation: 'Hosting application code on Google Cloud Run and Firebase Hosting where runtime environments, networking, and SSL certificates are automated.'
    },
    {
      term: 'Time-Series Data Management',
      category: 'Database',
      explanation: 'High-frequency telemetry (readings every 5s-60s) is partitioned into sequential subcollections indexed by timestamp, preventing monolithic document bloat.'
    },
    {
      term: 'REST API vs MQTT',
      category: 'Protocols',
      explanation: 'REST provides stateless, firewall-friendly HTTP endpoints (/api/sensors/data); MQTT provides ultralight publish/subscribe topics (plants/{id}/telemetry) ideal for low-bandwidth cellular nodes.'
    },
    {
      term: 'Serverless Computing',
      category: 'Compute',
      explanation: 'Stateless execution (Cloud Run / Lambda) that spins up on incoming sensor payloads and scales to zero when idle, eliminating idle server costs.'
    },
    {
      term: 'Event-Driven Architecture',
      category: 'Design Pattern',
      explanation: 'Sensor ingestion events automatically trigger rule evaluations, dispatching alerts and irrigation directives asynchronously without polling.'
    },
    {
      term: 'Device Offline Heartbeat',
      category: 'Reliability',
      explanation: 'Every telemetry post updates last_seen. If (now - last_seen > 180s), the cloud triggers an OFFLINE alert to detect network or power failure.'
    },
    {
      term: 'Scalability (10 -> 100,000 Nodes)',
      category: 'Architecture',
      explanation: 'Scaled via AWS IoT Core / GCP Pub/Sub brokers, stream decoupling (Kinesis), managed time-series stores (Amazon Timestream), and downsampling retention policies.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Cloud Computing & IoT System Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Comparison between the student laboratory architecture and commercial enterprise multi-tenant cloud architectures.
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveArch('student')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeArch === 'student'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Option A: Student / Local Cloud
            </button>
            <button
              onClick={() => setActiveArch('enterprise')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeArch === 'enterprise'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Option B: Enterprise AWS/GCP
            </button>
          </div>
        </div>
      </div>

      {/* Architecture Visual Diagram Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          {activeArch === 'student' ? <Server className="w-4 h-4 text-emerald-400" /> : <Cloud className="w-4 h-4 text-blue-400" />}
          <span>{activeArch === 'student' ? 'Student Prototype Pipeline (FastAPI / Express + Firestore)' : 'Enterprise Industrial IoT Pipeline (AWS IoT Core + Timestream + Lambda)'}</span>
        </h3>

        {activeArch === 'student' ? (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
              
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-emerald-400 font-bold">1. SENSORS / SIM</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">Python Virtual Simulator / ESP32 Node</div>
                <div className="text-[10px] text-slate-500 mt-2">Capacitive + DHT22</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-blue-400 font-bold">2. TRANSPORT</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">HTTPS REST API (POST)</div>
                <div className="text-[10px] text-slate-500 mt-2">Header x-api-key</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-amber-400 font-bold">3. BACKEND & LOGIC</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">FastAPI / Express Ingestion</div>
                <div className="text-[10px] text-slate-500 mt-2">Validation + Cooldown</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-cyan-400 font-bold">4. CLOUD PERSIST</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">Firestore / SQLite Store</div>
                <div className="text-[10px] text-slate-500 mt-2">Time-Series Collection</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-purple-400 font-bold">5. DASHBOARD</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">React 19 + Vite</div>
                <div className="text-[10px] text-slate-500 mt-2">SVG Trends & Overrides</div>
              </div>

            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs font-sans text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">Student Workflow Explanation: </strong>
              The Python simulator models soil physics and sends JSON payloads to <code className="text-emerald-400">/api/sensors/data</code>. The backend evaluates the configured plant profile threshold. When moisture drops below target and cooldown is satisfied, the cloud initiates virtual irrigation, returning an immediate actuation directive that elevates moisture on subsequent simulator cycles.
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
              
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-emerald-400 font-bold">1. 100,000+ NODES</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">Industrial Microcontrollers</div>
                <div className="text-[10px] text-slate-500 mt-2">MQTTS / TLS 1.3 X.509</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-blue-400 font-bold">2. IOT BROKER</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">AWS IoT Core / GCP PubSub</div>
                <div className="text-[10px] text-slate-500 mt-2">Device Shadow / Rules</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-amber-400 font-bold">3. SERVERLESS</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">AWS Lambda / Cloud Run</div>
                <div className="text-[10px] text-slate-500 mt-2">Horizontally Autoscaled</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-cyan-400 font-bold">4. TIME-SERIES DB</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">Amazon Timestream</div>
                <div className="text-[10px] text-slate-500 mt-2">DynamoDB Metadata</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="text-[11px] text-purple-400 font-bold">5. CLOUDFRONT & SNS</div>
                <div className="text-slate-300 mt-1 font-sans text-xs">Enterprise Multi-Tenant UI</div>
                <div className="text-[10px] text-slate-500 mt-2">SMS / Push Dispatch</div>
              </div>

            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs font-sans text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">Enterprise Workflow Explanation: </strong>
              MQTT messages are ingested into an IoT message queue which buffers bursts of 1,000,000+ readings. Serverless event consumers process incoming batches, store hot telemetry in high-throughput time-series engines, and archive cold logs to S3. Actuation directives are written to the IoT Device Shadow, which the edge node synchronizes with whenever connectivity allows.
            </div>
          </div>
        )}
      </div>

      {/* Cloud Security Warning Callout */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-400" />
          <span>Security Analysis: Why Exposing IoT Control Endpoints is Dangerous</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Publicly exposing an unauthenticated IoT actuator endpoint (such as an open <code className="text-amber-300">/water</code> POST URL) creates severe physical and cyber risks. An attacker or crawler can trigger denial-of-service pump flooding, drowning root systems, causing structural water damage, depleting reservoirs, and burning out pump motors. In this architecture, all control endpoints require user authentication (JWT Bearer tokens) and rate-limiting guards, while device telemetry ingestion requires cryptographic API keys.
        </p>
      </div>

      {/* Cloud Computing Concepts Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <span>Cloud Computing Concepts Demonstrated in this Project</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cloudConcepts.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 font-mono">{item.term}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.category}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
