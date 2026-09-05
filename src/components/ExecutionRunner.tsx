import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Send,
  Terminal,
  X,
  FileCheck2,
  ListTodo
} from 'lucide-react';
import { useRunbookStore } from '../store/useRunbookStore';
import type { StepStatus } from '../types/runbook';

export const ExecutionRunner: React.FC = () => {
  const {
    activeSessions,
    completedSessions,
    selectedSessionId,
    selectSession,
    updateStepStatus,
    addSessionLog,
    completeExecutionSession,
    cancelExecutionSession
  } = useRunbookStore();

  const allSessions = [...activeSessions, ...completedSessions];
  const currentSession = allSessions.find((s) => s.id === selectedSessionId) || activeSessions[0] || completedSessions[0];

  const [copiedCmdId, setCopiedCmdId] = useState<string | null>(null);
  const [logMessage, setLogMessage] = useState('');
  const [stepNoteInputs, setStepNoteInputs] = useState<Record<string, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer tick for active session
  useEffect(() => {
    if (!currentSession || currentSession.status !== 'active') return;

    const interval = setInterval(() => {
      const start = new Date(currentSession.startedAt).getTime();
      const now = new Date().getTime();
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  if (!currentSession) {
    return (
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-12 text-center">
        <Play className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">No Active Incident Sessions</h3>
        <p className="text-sm text-slate-400 mt-1">
          Select a playbook from the Catalog or launch an alert trigger to start a runbook execution.
        </p>
      </div>
    );
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, cmdId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmdId(cmdId);
    setTimeout(() => setCopiedCmdId(null), 2000);
  };

  const handleSendLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logMessage.trim()) return;
    addSessionLog(currentSession.id, 'COMMANDER_NOTE', logMessage, 'info');
    setLogMessage('');
  };

  const handleStepStatusChange = (stepId: string, newStatus: StepStatus) => {
    const notes = stepNoteInputs[stepId];
    updateStepStatus(currentSession.id, stepId, newStatus, notes);
  };

  const completedCount = currentSession.steps.filter(
    (s) => s.status === 'completed' || s.status === 'skipped'
  ).length;
  const progressPercent = Math.round((completedCount / currentSession.steps.length) * 100);

  const getStepStatusBadge = (status?: StepStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'in_progress':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'skipped':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Selector Bar */}
      {allSessions.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Sessions:</span>
          {allSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSession(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${
                s.id === currentSession.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {s.playbookTitle.substring(0, 25)}... ({s.status})
            </button>
          ))}
        </div>
      )}

      {/* Incident Header Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                SEV-{currentSession.severity}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-medium border ${
                  currentSession.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                STATUS: {currentSession.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {currentSession.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-2">{currentSession.playbookTitle}</h1>
          </div>

          {/* Incident Timer & Resolve Actions */}
          <div className="flex items-center space-x-3">
            {currentSession.status === 'active' && (
              <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Elapsed Time</div>
                  <div className="text-lg font-mono font-bold text-white">{formatTimer(elapsedSeconds)}</div>
                </div>
              </div>
            )}

            {currentSession.status === 'active' && (
              <>
                <button
                  onClick={() => {
                    const rootCause = prompt('Enter root cause / resolution summary:');
                    if (rootCause !== null) {
                      completeExecutionSession(currentSession.id, 'All steps verified.', rootCause);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Resolve Incident</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Cancel active execution session?')) {
                      cancelExecutionSession(currentSession.id);
                    }
                  }}
                  className="bg-slate-700 hover:bg-red-600/80 text-slate-200 text-xs px-3 py-2.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Execution Progress ({progressPercent}%)</span>
            <span>
              {completedCount} / {currentSession.steps.length} Steps Complete
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid Layout: Step Runner & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Runner Column */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-indigo-400" /> Interactive Execution Steps
          </h2>

          {currentSession.steps.map((step, index) => (
            <div
              key={step.id}
              className={`bg-slate-800/90 border rounded-xl p-5 shadow-sm space-y-4 transition-all ${
                step.status === 'in_progress'
                  ? 'border-indigo-500/80 ring-1 ring-indigo-500/50 bg-slate-800'
                  : 'border-slate-700/80'
              }`}
            >
              {/* Step Title Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                      step.status === 'completed'
                        ? 'bg-emerald-500 text-slate-950'
                        : step.status === 'failed'
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{step.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getStepStatusBadge(
                    step.status
                  )}`}
                >
                  {step.status || 'pending'}
                </span>
              </div>

              {/* Step Commands */}
              {step.commands && step.commands.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Runnable Commands:
                  </span>
                  {step.commands.map((cmd) => (
                    <div
                      key={cmd.id}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="font-mono text-xs overflow-x-auto text-emerald-400">
                        <span className="text-slate-500 select-none">$ </span>
                        {cmd.command}
                      </div>

                      <button
                        onClick={() => copyToClipboard(cmd.command, cmd.id)}
                        className="flex items-center space-x-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded transition-colors self-start sm:self-auto"
                      >
                        {copiedCmdId === cmd.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Command</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Step Verification & Notes input */}
              {currentSession.status === 'active' && (
                <div className="pt-2 border-t border-slate-700/60 space-y-3">
                  <input
                    type="text"
                    placeholder="Add step log note (e.g. Verified lag back to 0ms)..."
                    value={stepNoteInputs[step.id] || ''}
                    onChange={(e) => setStepNoteInputs({ ...stepNoteInputs, [step.id]: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />

                  {/* Step Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleStepStatusChange(step.id, 'in_progress')}
                      className="text-xs bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 px-3 py-1.5 rounded transition-colors"
                    >
                      Start Step
                    </button>
                    <button
                      onClick={() => handleStepStatusChange(step.id, 'completed')}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded transition-colors flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </button>
                    <button
                      onClick={() => handleStepStatusChange(step.id, 'failed')}
                      className="text-xs bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 px-2.5 py-1.5 rounded transition-colors"
                    >
                      Mark Failed
                    </button>
                    <button
                      onClick={() => handleStepStatusChange(step.id, 'skipped')}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1.5 rounded transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live Audit Log Feed Column */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 space-y-4 h-fit">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <FileCheck2 className="w-5 h-5 text-emerald-400" /> Incident Audit Timeline
          </h2>

          {/* Send Note Input */}
          {currentSession.status === 'active' && (
            <form onSubmit={handleSendLog} className="flex space-x-2">
              <input
                type="text"
                placeholder="Log commander note to timeline..."
                value={logMessage}
                onChange={(e) => setLogMessage(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Audit Log Timeline list */}
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {currentSession.logs.map((log) => (
              <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="text-slate-400 font-semibold">{log.author}</span>
                </div>
                <div className="font-semibold text-indigo-300 font-mono text-[11px]">{log.action}</div>
                <p className="text-slate-300 leading-relaxed">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
