import React, { useState } from 'react';
import { BarChart2, Clock, CheckCircle, Copy, Check, FileText, Layers, TrendingUp } from 'lucide-react';
import { useRunbookStore } from '../store/useRunbookStore';
import type { ExecutionSession } from '../types/runbook';

export const AnalyticsView: React.FC = () => {
  const { playbooks, completedSessions, activeSessions } = useRunbookStore();
  const [copiedMd, setCopiedMd] = useState(false);
  const [selectedPostMortem, setSelectedPostMortem] = useState<ExecutionSession | null>(
    completedSessions[0] || null
  );

  const totalRunbooks = playbooks.length;
  const totalExecutions = completedSessions.length + activeSessions.length;

  // Calculate Mean Time to Resolution (MTTR) in minutes
  const resolvedSessions = completedSessions.filter((s) => s.status === 'completed' && s.endedAt);
  const totalDurationMinutes = resolvedSessions.reduce((acc, s) => {
    const start = new Date(s.startedAt).getTime();
    const end = new Date(s.endedAt!).getTime();
    return acc + (end - start) / (1000 * 60);
  }, 0);

  const avgMttrMinutes = resolvedSessions.length > 0 ? Math.round(totalDurationMinutes / resolvedSessions.length) : 0;
  const successRate = completedSessions.length > 0
    ? Math.round((resolvedSessions.length / completedSessions.length) * 100)
    : 100;

  const generateMarkdownReport = (session: ExecutionSession) => {
    const startStr = new Date(session.startedAt).toUTCString();
    const endStr = session.endedAt ? new Date(session.endedAt).toUTCString() : 'N/A';

    return `# Incident Post-Mortem & Runbook Execution Report

**Incident ID:** ${session.id}
**Runbook Title:** ${session.playbookTitle}
**Severity Level:** SEV-${session.severity}
**Incident Commander:** ${session.commander}
**Status:** ${session.status.toUpperCase()}
**Start Time (UTC):** ${startStr}
**Resolution Time (UTC):** ${endStr}

---

## 1. Executive Summary & Root Cause
${session.rootCause ? session.rootCause : 'Root cause analysis pending post-incident review.'}

**Commander Notes:**
${session.postMortemNotes ? session.postMortemNotes : 'No additional post-mortem notes recorded.'}

---

## 2. Runbook Step Execution Breakdown
${session.steps
  .map(
    (s, idx) =>
      `### Step ${idx + 1}: ${s.title}
- **Status:** [${(s.status || 'pending').toUpperCase()}]
- **Executed By:** ${s.executedBy || 'Responder'}
- **Step Notes:** ${s.notes || 'None'}
`
  )
  .join('\n')}

---

## 3. Audit Timeline & Event Logs
| Timestamp (UTC) | Author | Action | Details |
|---|---|---|---|
${session.logs
  .map(
    (l) =>
      `| ${new Date(l.timestamp).toISOString()} | ${l.author} | ${l.action} | ${l.details.replace(/\|/g, '-')} |`
  )
  .join('\n')}
`;
  };

  const copyPostMortemMarkdown = (session: ExecutionSession) => {
    const md = generateMarkdownReport(session);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-400" />
            Operational Analytics & Post-Mortem Generator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track MTTR (Mean Time to Resolution), playbook reliability, step execution audit logs, and export Markdown reports.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Playbooks</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalRunbooks}</div>
          <span className="text-[11px] text-slate-400">In standard catalog</span>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Avg MTTR</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{avgMttrMinutes} Min</div>
          <span className="text-[11px] text-slate-400">Mean time to resolution</span>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Executions</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalExecutions}</div>
          <span className="text-[11px] text-slate-400">{activeSessions.length} active sessions</span>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Success Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{successRate}%</div>
          <span className="text-[11px] text-slate-400">Completed without rollback</span>
        </div>
      </div>

      {/* Main Section: Report Exporter & Completed List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Completed Incident History */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <FileText className="w-5 h-5 text-indigo-400" /> Incident Post-Mortem Records
          </h2>

          {completedSessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No completed incident executions yet. Run an active playbook to generate post-mortem logs.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedPostMortem(session)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPostMortem?.id === session.id
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                      SEV-{session.severity}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mt-2">{session.playbookTitle}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    Commander: {session.commander} • {session.steps.length} Steps
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Markdown Post-Mortem Preview */}
        <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 space-y-4">
          {selectedPostMortem ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" /> Markdown Post-Mortem Exporter
                </h2>
                <button
                  onClick={() => copyPostMortemMarkdown(selectedPostMortem)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow transition-all flex items-center space-x-1.5"
                >
                  {copiedMd ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied Report</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Markdown Report</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preformatted Markdown Viewer */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {generateMarkdownReport(selectedPostMortem)}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              Select a completed incident session from the left menu to view and export its post-mortem report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
