import React, { useState } from 'react';
import { BookOpen, HelpCircle, Briefcase, GitBranch, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export const ProjectReportViewer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'interview' | 'report' | 'resume' | 'commits'>('interview');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [copiedResume, setCopiedResume] = useState<boolean>(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState<boolean>(false);

  const interviewQuestions = [
    {
      q: '1. Explain your project.',
      a: 'I designed and developed a Cloud-Connected Smart Plant Care & Watering System that captures environmental telemetry—including capacitive soil moisture, ambient temperature, relative humidity, light level, and reservoir depth—and streams it to a scalable cloud backend. To make the architecture thoroughly testable and reproducible without physical hardware dependencies, I engineered a Python-based virtual IoT sensor that models realistic environmental physics: diurnal temperature and light oscillations, gradual soil moisture transpiration, and dynamic moisture rebound when an irrigation pulse is received. On the cloud side, the platform implements a REST ingestion API, real-time device heartbeat tracking to detect offline outages, and an automated irrigation decision engine that evaluates plant-specific thresholds, reservoir levels, and cooldown timers to prevent over-watering. The frontend is a React dashboard delivering live metric monitoring, interactive SVG trend lines, plant profile configurations, and manual pump override controls. The exact same cloud architecture and API contract work seamlessly when connected to an ESP32 microcontroller running C++ firmware.'
    },
    {
      q: '2. Why did you use cloud computing in this project?',
      a: 'Cloud computing allows sensor telemetry to be stored and processed centrally, making the plant accessible remotely from any web browser without opening risky local NAT firewall ports. Furthermore, it provides scalable managed databases, REST APIs, monitoring, and automated alerting services, allowing the architecture to grow smoothly from one prototype plant to 100,000 commercial greenhouse nodes.'
    },
    {
      q: '3. How did you build the project without physical IoT hardware?',
      a: 'I developed a Python virtual IoT sensor simulator that behaves like a physical ESP32 node. It generates realistic, non-random sensor values where soil moisture decays naturally over time, ambient temperature and light follow a diurnal solar curve, and watering triggers gradual moisture rebound. The simulator features network timeout retries with exponential backoff and offline spooling.'
    },
    {
      q: '4. How does the automatic watering system work?',
      a: 'Each plant species has a calibrated soil-moisture threshold (e.g. Tomato at 40%, Succulent at 20%, Basil at 35%). When a reading reaches the backend, the automation engine compares moisture against threshold. If dry, the system verifies that the water reservoir is above minimum safety margin (15%) and that the 180s cooldown timer has completed. Once verified, it triggers the virtual pump for a 3-second pulse and records an audit log.'
    },
    {
      q: '5. How does data travel from the IoT device to the cloud?',
      a: 'In the simulated version, the Python IoT client transmits JSON sensor packets via HTTPS POST to /api/sensors/data with an x-api-key authentication header. The cloud REST API validates the payload and stores it in the time-series database. In the physical implementation, the ESP32 uses HTTPClient or an MQTT broker (AWS IoT Core) over TLS 1.3.'
    },
    {
      q: '6. Why do IoT systems often use MQTT instead of REST?',
      a: 'MQTT is an ultra-lightweight publish-subscribe protocol designed for bandwidth-constrained, high-latency, or battery-powered devices. Its binary packet header is as small as 2 bytes compared to hundreds of bytes for HTTP headers. Instead of point-to-point polling, edge devices publish to topics while cloud backend consumers subscribe asynchronously.'
    },
    {
      q: '7. How does your system detect an offline device?',
      a: 'Every sensor reading updates the device last_seen timestamp in the cloud database. A background worker periodically calculates: (Current Time - Last Seen). If this duration exceeds the configured heartbeat interval (180 seconds), the device status transitions to OFFLINE and a WARNING alert is dispatched.'
    },
    {
      q: '8. How would your system handle 100,000 plants sending sensor readings?',
      a: 'At enterprise scale, I would place a managed message broker (AWS IoT Core / GCP PubSub) in front of the ingestion pipeline to buffer bursts of traffic. Telemetry would be processed by auto-scaling serverless functions (AWS Lambda) and committed to a distributed time-series database (Amazon Timestream or GCP Bigtable). Old telemetry would be downsampled and archived to S3 Glacier.'
    },
    {
      q: '9. How did you test this project?',
      a: 'I implemented an automated 25-scenario test matrix covering unit tests for watering logic (cooldown enforcement, tank safety cutoff), REST API validation (rejecting out-of-bounds inputs like soil moisture > 100%), simulator exponential backoff retries, and end-to-end integration tests verifying automated pump activation and alert generation.'
    },
    {
      q: '10. How can this project be improved further?',
      a: 'Future improvements include: integrating meteorological forecast APIs to postpone watering if rain is forecasted, training machine learning regression models on soil drying curves (Δmoisture/Δt) for predictive irrigation, adding multi-zone solenoid valve control, and deploying physical ESP32 nodes over LoRaWAN.'
    }
  ];

  const resumeBullets = [
    '• Architected and deployed an end-to-end Cloud IoT plant monitoring and precision irrigation platform processing multi-sensor telemetry (soil moisture, temperature, humidity, lux) with sub-second dashboard reactivity.',
    '• Engineered a Python-based virtual IoT sensor simulating diurnal solar oscillations, soil transpiration decay, and closed-loop watering response, enabling 100% hardware-independent testing and demonstration.',
    '• Developed an autonomous cloud watering engine with configurable botanical threshold profiles, reservoir safety cutoffs, anti-saturation cooldown gatekeepers, and automated heartbeat-driven offline detection.'
  ];

  const linkedInPost = `Excited to showcase my latest Cloud Computing & IoT project: Cloud-Connected Smart Plant Care & Watering System! 🌱☁️

To tackle freshwater wastage and irregular irrigation, I built a full-stack, cloud-connected precision agriculture platform that ingests environmental telemetry, evaluates plant-specific moisture thresholds (Tomato, Succulent, Herb), and executes automated closed-loop irrigation.

Key Highlights:
🔹 Python Virtual IoT Sensor Simulator: Models realistic soil moisture decay and solar heat curves, making the system testable without physical hardware.
🔹 Cloud Ingestion REST API: Validates incoming payloads, updates device heartbeats, and enforces security guards.
🔹 Irrigation Decision Engine: Configurable botanical thresholds, anti-saturation cooldowns, and reservoir protection.
🔹 React 19 Operations Dashboard: Real-time telemetry visualization, interactive SVG trends, alerts management, and manual actuator overrides.
🔹 Physical Hardware Blueprint: Complete ESP32 C++ firmware and low-voltage wiring schematic included.

Tech Stack: React 19, Vite, TypeScript, Express / FastAPI, Python, Tailwind CSS, IoT Architecture, Cloud Computing.

#CloudComputing #IoT #SmartAgriculture #Python #React #FastAPI #ESP32 #SoftwareEngineering`;

  const commitHistory = [
    { day: 'Day 1', commit: 'Initialize smart plant cloud project', desc: 'Project scaffolding, environment config, and architecture specification' },
    { day: 'Day 2', commit: 'Add virtual IoT sensor simulator', desc: 'Python physics engine simulating soil drying and solar cycles' },
    { day: 'Day 3', commit: 'Implement sensor REST API', desc: 'POST /api/sensors/data with input validation and security guards' },
    { day: 'Day 4', commit: 'Integrate cloud database', desc: 'Devices collection and time-series sensor readings subcollections' },
    { day: 'Day 5', commit: 'Add automated watering engine', desc: 'Rule evaluator enforcing moisture thresholds and reservoir safety' },
    { day: 'Day 6', commit: 'Implement plant-specific thresholds', desc: 'Horticultural profiles: Tomato (40%), Succulent (20%), Herb (35%)' },
    { day: 'Day 7', commit: 'Add watering event tracking', desc: 'Audit logging for automated and manual actuator pulses' },
    { day: 'Day 8', commit: 'Build real-time monitoring dashboard', desc: 'React 19 operations interface with live telemetry and SVG charts' },
    { day: 'Day 9', commit: 'Implement alert system', desc: 'Critical and warning notifications with acknowledgment flow' },
    { day: 'Day 10', commit: 'Add device offline detection', desc: 'Heartbeat evaluator flagging inactive nodes after 180 seconds' },
    { day: 'Day 11', commit: 'Add historical analytics', desc: 'Water consumption and environmental summary metrics' },
    { day: 'Day 12', commit: 'Add automated tests', desc: '25-scenario verification test harness covering unit and API logic' },
    { day: 'Day 13', commit: 'Complete README and documentation', desc: 'Full academic report, interview preparation guide, and hardware schematic' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Academic Project Report & Placement Preparation
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Curated materials for academic defense, viva presentation, resume inclusion, and technical cloud interviews.
            </p>
          </div>

          {/* Sub-Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveSubTab('interview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'interview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interview Q&A (10)
            </button>
            <button
              onClick={() => setActiveSubTab('resume')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'resume' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resume & LinkedIn
            </button>
            <button
              onClick={() => setActiveSubTab('commits')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'commits' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Git History (13 Days)
            </button>
            <button
              onClick={() => setActiveSubTab('report')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'report' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Course Report
            </button>
          </div>
        </div>
      </div>

      {/* Tab: Interview Q&A */}
      {activeSubTab === 'interview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Predicted Interview & Viva Questions (10 Core Questions)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">10 of 10 Prepared</span>
          </div>

          <div className="space-y-3">
            {interviewQuestions.map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-emerald-300 font-sans">
                      {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-900">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Resume & LinkedIn */}
      {activeSubTab === 'resume' && (
        <div className="space-y-6">
          {/* Resume Bullets Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Impact-Oriented Resume Bullet Points</span>
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resumeBullets.join('\n'));
                  setCopiedResume(true);
                  setTimeout(() => setCopiedResume(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
              >
                {copiedResume ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedResume ? 'Copied!' : 'Copy Bullets'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-3 leading-relaxed">
              {resumeBullets.map((bullet, i) => (
                <p key={i}>{bullet}</p>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                2-Line Compact Resume Summary:
              </span>
              <p className="text-xs text-slate-300 italic font-sans">
                &ldquo;Cloud-Connected Smart Plant Care & Watering System: Full-stack IoT platform integrating virtual Python sensor telemetry with an autonomous cloud decision engine, real-time React dashboard, and ESP32 hardware blueprint.&rdquo;
              </p>
            </div>
          </div>

          {/* LinkedIn Post Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-semibold text-white">
                Professional LinkedIn Project Showcase Post
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(linkedInPost);
                  setCopiedLinkedIn(true);
                  setTimeout(() => setCopiedLinkedIn(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
              >
                {copiedLinkedIn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLinkedIn ? 'Copied!' : 'Copy Post'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-sans text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {linkedInPost}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Git Commit History Roadmap */}
      {activeSubTab === 'commits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>Recommended 13-Day GitHub Commit History</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Industry-Style Incremental Cadence</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {commitHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold w-16">{item.day}</span>
                  <div>
                    <span className="text-white font-semibold font-sans">{item.commit}</span>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <code className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded">
                  git commit -m &quot;{item.commit}&quot;
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Full Course Report */}
      {activeSubTab === 'report' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed font-sans space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
            Executive Academic Project Report
          </h3>
          <p>
            <strong>Title:</strong> Cloud-Connected Smart Plant Care & Watering System<br />
            <strong>Domain:</strong> Cloud Computing, Internet of Things (IoT), Precision Agriculture<br />
            <strong>Primary Goal:</strong> Build a scalable cloud infrastructure for environmental monitoring and automated closed-loop irrigation that operates flawlessly with or without physical IoT hardware.
          </p>

          <h4 className="text-sm font-bold text-emerald-400 mt-4">1. Abstract</h4>
          <p>
            Water inefficiency in agricultural and domestic horticulture results in extensive natural resource waste and crop stress. This project demonstrates an enterprise IoT cloud platform that decouples edge sensor acquisition from decision automation. Utilizing a Python virtual IoT sensor simulator, the system replicates botanical physics: solar irradiance curves, ambient temperature and humidity fluctuations, transpiration-driven moisture decay, and irrigation recharge dynamics. The cloud backend implements a REST ingestion API, automated irrigation decision engine with cooldown protection, multi-tenant persistence, real-time operations dashboard, and device health heartbeat monitoring.
          </p>

          <h4 className="text-sm font-bold text-emerald-400 mt-4">2. Problem Statement & Objectives</h4>
          <p>
            Traditional irrigation relies on inflexible clock schedules that overwater wet soil or fail during unexpected heat waves. This project delivers closed-loop decision making, automated safety cutoffs when water reservoirs are dry (&lt;15%), anti-saturation cooldown timers, and instant alerting on missed device heartbeats (&gt;180s).
          </p>

          <h4 className="text-sm font-bold text-emerald-400 mt-4">3. Cloud Concepts Demonstrated</h4>
          <p>
            The project demonstrates core cloud tenets: Software-as-a-Service (React dashboard), Platform-as-a-Service (Cloud Run deployment), time-series datastore partitioning, REST API validation, event-driven actuation, secret management (.env.example), and horizontal autoscaling architectures for 100,000+ nodes.
          </p>
        </div>
      )}
    </div>
  );
};
