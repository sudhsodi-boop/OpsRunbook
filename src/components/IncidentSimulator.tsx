import React, { useState } from 'react';
import { Bell, Zap, Play, CheckCircle2, Activity } from 'lucide-react';
import { useRunbookStore } from '../store/useRunbookStore';
import type { Severity } from '../types/runbook';

export const IncidentSimulator: React.FC = () => {
  const { playbooks, alerts, createSimulatedAlert, startExecutionSession } = useRunbookStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [service, setService] = useState('Core Database Cluster');
  const [severity, setSeverity] = useState<Severity>('P1');
  const [source, setSource] = useState<'Datadog' | 'PagerDuty' | 'AWS CloudWatch' | 'Sentry' | 'Manual Alert'>('Datadog');

  const presetAlerts = [
    {
      title: 'High Replication Lag on PostgreSQL Replica',
      description: 'Replication lag exceeded 450MB WAL difference. Secondary node falling behind.',
      service: 'Core Database Cluster',
      severity: 'P1' as Severity,
      source: 'Datadog' as const
    },
    {
      title: 'Pod Memory Usage > 95% threshold',
      description: 'API Gateway memory exhaustion detected on k8s pod group worker-3.',
      service: 'API Gateway Service',
      severity: 'P2' as Severity,
      source: 'AWS CloudWatch' as const
    },
    {
      title: 'Unusual Admin Login from Overseas Subnet',
      description: 'Security rule triggered for root privileges token elevation.',
      service: 'IAM & Authentication',
      severity: 'P1' as Severity,
      source: 'Sentry' as const
    },
    {
      title: '502 Bad Gateway Error Spike on Checkout API',
      description: 'Error rate increased from 0.01% to 14.8% following deployment v2.4.1.',
      service: 'Checkout Service',
      severity: 'P2' as Severity,
      source: 'PagerDuty' as const
    }
  ];

  const handleSimulate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    // Find best matching playbook
    const matched = playbooks.find(
      (pb) =>
        pb.serviceName?.toLowerCase() === service.toLowerCase() ||
        pb.title.toLowerCase().includes(title.toLowerCase()) ||
        pb.tags.some((t) => title.toLowerCase().includes(t.toLowerCase()))
    );

    createSimulatedAlert({
      title,
      description: description || 'Simulated operational anomaly detected by alerting agent.',
      service,
      severity,
      source,
      matchedPlaybookId: matched?.id,
      payload: {
        simulated_by: 'Incident Sandbox Simulator',
        host: 'prod-k8s-node-09',
        event_id: `evt-${Math.random().toString(36).substring(2, 8)}`
      }
    });

    setTitle('');
    setDescription('');
  };

  const fillPreset = (preset: typeof presetAlerts[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setService(preset.service);
    setSeverity(preset.severity);
    setSource(preset.source);
  };

  const getSeverityStyle = (sev: Severity) => {
    switch (sev) {
      case 'P1':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'P2':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'P3':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Alert & Event Integration Simulator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Simulate PagerDuty, Datadog, or AWS CloudWatch alerts to test auto-matching to runbook playbooks and incident response triggers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trigger Alert Form */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
            <Bell className="w-5 h-5 text-indigo-400" /> Trigger Simulated Alert
          </h2>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {presetAlerts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fillPreset(p)}
                  className="text-xs bg-slate-900/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded transition-colors"
                >
                  {p.title.substring(0, 25)}...
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSimulate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Alert Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. High Memory Usage on API Pod"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Alert Details / Payload</label>
              <textarea
                rows={2}
                placeholder="Alert diagnostic log or threshold breakdown..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Service</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200"
                >
                  <option value="Core Database Cluster">Core Database Cluster</option>
                  <option value="API Gateway Service">API Gateway Service</option>
                  <option value="IAM & Authentication">IAM & Authentication</option>
                  <option value="Checkout Service">Checkout Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Alert Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200"
                >
                  <option value="Datadog">Datadog</option>
                  <option value="PagerDuty">PagerDuty</option>
                  <option value="AWS CloudWatch">AWS CloudWatch</option>
                  <option value="Sentry">Sentry</option>
                  <option value="Manual Alert">Manual Alert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {(['P1', 'P2', 'P3', 'P4'] as Severity[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`py-1.5 rounded text-xs font-mono font-bold border transition-all ${
                      severity === s
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-2.5 rounded-lg shadow-lg transition-all flex items-center justify-center space-x-2 mt-2"
            >
              <Zap className="w-4 h-4 fill-current text-amber-300" />
              <span>Emit Event / Trigger Alert</span>
            </button>
          </form>
        </div>

        {/* Live Alert Stream */}
        <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" /> Live Alert Event Stream
            </h2>
            <span className="text-xs text-slate-400 font-mono">{alerts.length} Events Total</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-10">No alerts received yet.</p>
            ) : (
              alerts.map((alert) => {
                const matchedPb = playbooks.find((pb) => pb.id === alert.matchedPlaybookId);

                return (
                  <div
                    key={alert.id}
                    className="bg-slate-900 border border-slate-700/80 rounded-lg p-4 space-y-3 shadow-md relative overflow-hidden"
                  >
                    {/* Severity Indicator Ribbon */}
                    <div
                      className={`absolute top-0 left-0 bottom-0 w-1 ${
                        alert.severity === 'P1'
                          ? 'bg-red-500'
                          : alert.severity === 'P2'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />

                    <div className="pl-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getSeverityStyle(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {alert.source}
                          </span>
                          <span className="text-xs text-slate-400">{alert.service}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white mt-2">{alert.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{alert.description}</p>

                      {/* Auto-Matched Playbook Status Box */}
                      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                        {matchedPb ? (
                          <div className="flex items-center space-x-2 text-xs text-indigo-300 bg-indigo-950/50 border border-indigo-800/60 px-2.5 py-1 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Matched Runbook: <strong>{matchedPb.title}</strong></span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No exact playbook match</span>
                        )}

                        {matchedPb && alert.status !== 'resolved' && (
                          <button
                            onClick={() => startExecutionSession(matchedPb.id, 'Incident Commander', alert.id)}
                            className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1 rounded transition-colors shadow"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Launch Runbook</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
