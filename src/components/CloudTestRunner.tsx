import React, { useState } from 'react';
import { TestCaseResult } from '../types/iot';
import { PlayCircle, CheckCircle2, XCircle, Clock, ShieldCheck, RefreshCw } from 'lucide-react';

interface CloudTestRunnerProps {
  onRunTestSuite: () => Promise<any>;
}

export const CloudTestRunner: React.FC<CloudTestRunnerProps> = ({ onRunTestSuite }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [summary, setSummary] = useState<{ total: number; passed: number; failed: number } | null>(null);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  const executeTests = async () => {
    setIsRunning(true);
    try {
      const data = await onRunTestSuite();
      setTestResults(data.results);
      setSummary({
        total: data.total_tests,
        passed: data.passed,
        failed: data.failed
      });
    } catch (err) {
      console.error('Test execution failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredTests = testResults?.filter(t => {
    if (filter === 'passed') return t.status === 'PASS';
    if (filter === 'failed') return t.status === 'FAIL';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Test Suite Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Automated Verification Suite (25 Test Scenarios)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Covers full-cycle validation: ingestion bounds verification, automated threshold actuation, pump cooldown enforcement, reservoir safety cutoffs, offline heartbeat detection, and API security.
            </p>
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Test Suite...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Execute All 25 Tests</span>
              </>
            )}
          </button>
        </div>

        {/* Summary Metric Ribbon */}
        {summary && (
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total Scenarios:</span>
              <span className="font-mono font-bold text-white">{summary.total}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Passed:</span>
              <span className="font-mono font-bold text-emerald-400">{summary.passed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Failed:</span>
              <span className="font-mono font-bold text-rose-400">{summary.failed}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Success Rate:</span>
              <span className="font-mono font-bold text-emerald-300">
                {Math.round((summary.passed / summary.total) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {testResults && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Tests ({testResults.length})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'passed'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Passed ({summary?.passed})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'failed'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Failed ({summary?.failed})
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Automated backend execution via Node/Express test harness
          </span>
        </div>
      )}

      {/* Test Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {!testResults ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p>Ready to verify. Click &quot;Execute All 25 Tests&quot; to run the complete test matrix against the live backend.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-normal w-16">ID</th>
                  <th className="py-3 px-4 font-normal">Scenario & Test Subject</th>
                  <th className="py-3 px-4 font-normal">Input Parameter</th>
                  <th className="py-3 px-4 font-normal">Expected Outcome</th>
                  <th className="py-3 px-4 font-normal">Actual Result</th>
                  <th className="py-3 px-4 font-normal text-right w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTests?.map((tc) => (
                  <tr key={tc.test_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-bold">
                      TC-{String(tc.test_id).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-200 max-w-xs">
                      {tc.scenario}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={tc.input}>
                      {tc.input}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs font-sans">
                      {tc.expected_result}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs font-sans">
                      {tc.actual_result}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {tc.status === 'PASS' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>FAIL</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
