import React, { useState } from 'react';
import { Save, ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Terminal, ListChecks } from 'lucide-react';
import { useRunbookStore } from '../store/useRunbookStore';
import type { Playbook, RunbookStep, Severity, CommandScript } from '../types/runbook';

interface PlaybookEditorProps {
  playbook?: Playbook;
  onBack: () => void;
}

export const PlaybookEditor: React.FC<PlaybookEditorProps> = ({ playbook, onBack }) => {
  const { addPlaybook, updatePlaybook } = useRunbookStore();

  const [title, setTitle] = useState(playbook?.title || '');
  const [description, setDescription] = useState(playbook?.description || '');
  const [category, setCategory] = useState<Playbook['category']>(playbook?.category || 'Infrastructure');
  const [severity, setSeverity] = useState<Severity>(playbook?.severity || 'P2');
  const [serviceName, setServiceName] = useState(playbook?.serviceName || '');
  const [author, setAuthor] = useState(playbook?.author || 'Site Reliability Engineer');
  const [tagsInput, setTagsInput] = useState(playbook?.tags.join(', ') || 'production, infrastructure');
  const [prerequisitesInput, setPrerequisitesInput] = useState(playbook?.prerequisites?.join('\n') || '');

  const [steps, setSteps] = useState<RunbookStep[]>(
    playbook?.steps || [
      {
        id: 'step-1',
        order: 1,
        title: 'Initial Assessment & Healthcheck',
        description: 'Verify system symptoms and review active monitoring metrics.',
        estimatedMinutes: 3,
        isRequired: true,
        commands: [
          {
            id: 'cmd-1',
            label: 'Check Service Status',
            command: 'curl -I https://internal.service/health',
            environment: 'Production'
          }
        ]
      }
    ]
  );

  const handleAddStep = () => {
    const newStep: RunbookStep = {
      id: `step-${Date.now()}`,
      order: steps.length + 1,
      title: 'New Response Step',
      description: 'Describe the action required in this step.',
      estimatedMinutes: 5,
      isRequired: true,
      commands: []
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      alert('Playbook must contain at least one step.');
      return;
    }
    const updated = steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(updated);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) return;
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setSteps(newSteps.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleUpdateStep = (index: number, field: keyof RunbookStep, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleAddCommand = (stepIndex: number) => {
    const updated = [...steps];
    const currentCmds = updated[stepIndex].commands || [];
    updated[stepIndex].commands = [
      ...currentCmds,
      {
        id: `cmd-${Date.now()}`,
        label: 'Run Diagnostic Command',
        command: 'kubectl get pods',
        environment: 'Production'
      }
    ];
    setSteps(updated);
  };

  const handleUpdateCommand = (stepIndex: number, cmdIndex: number, field: keyof CommandScript, value: string) => {
    const updated = [...steps];
    const cmds = [...(updated[stepIndex].commands || [])];
    cmds[cmdIndex] = { ...cmds[cmdIndex], [field]: value };
    updated[stepIndex].commands = cmds;
    setSteps(updated);
  };

  const handleRemoveCommand = (stepIndex: number, cmdIndex: number) => {
    const updated = [...steps];
    updated[stepIndex].commands = updated[stepIndex].commands?.filter((_, i) => i !== cmdIndex);
    setSteps(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a playbook title.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const prerequisites = prerequisitesInput
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const estimatedTotalMinutes = steps.reduce((sum, s) => sum + (Number(s.estimatedMinutes) || 0), 0);

    const savedPlaybook: Playbook = {
      id: playbook?.id || `pb-${Date.now()}`,
      title,
      description,
      category,
      severity,
      tags,
      serviceName,
      estimatedTotalMinutes,
      author,
      version: playbook?.version || '1.0.0',
      updatedAt: new Date().toISOString(),
      prerequisites,
      steps
    };

    if (playbook) {
      updatePlaybook(savedPlaybook);
    } else {
      addPlaybook(savedPlaybook);
    }

    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
        <h2 className="text-xl font-bold text-white">
          {playbook ? 'Edit Playbook' : 'Create New Incident Playbook'}
        </h2>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Playbook</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Playbook Overview Metadata Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-200 border-b border-slate-700/60 pb-2">
            Playbook Metadata
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Playbook Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. PostgreSQL High Memory & Cache Eviction Response"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Brief summary of the incident symptoms and recovery goal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Playbook['category'])}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Infrastructure">Infrastructure</option>
                <option value="Database">Database</option>
                <option value="Security">Security</option>
                <option value="Deployment">Deployment</option>
                <option value="Network">Network</option>
                <option value="Incident Response">Incident Response</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Default Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="P1">P1 - Critical Outage</option>
                <option value="P2">P2 - High Priority</option>
                <option value="P3">P3 - Moderate Degraded Service</option>
                <option value="P4">P4 - Low / Minor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Service Name</label>
              <input
                type="text"
                placeholder="e.g. Core Database Cluster"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Author / Owner Team</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Prerequisites & Required Access (One per line)
              </label>
              <textarea
                rows={2}
                placeholder="Access to AWS Bastion Host&#10;Verify PagerDuty incident responder role"
                value={prerequisitesInput}
                onChange={(e) => setPrerequisitesInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Steps Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-indigo-400" />
              Step-by-Step Response Procedure
            </h3>
            <button
              type="button"
              onClick={handleAddStep}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Step</span>
            </button>
          </div>

          {steps.map((step, index) => (
            <div key={step.id} className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-indigo-600 text-white font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleUpdateStep(index, 'title', e.target.value)}
                    placeholder="Step Title..."
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 w-64 md:w-96"
                  />
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleMoveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(index)}
                    className="p-1 text-slate-400 hover:text-red-400 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Step Description</label>
                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => handleUpdateStep(index, 'description', e.target.value)}
                    placeholder="Describe what needs to be verified or executed..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Est. Duration (Min)</label>
                  <input
                    type="number"
                    min="1"
                    value={step.estimatedMinutes}
                    onChange={(e) => handleUpdateStep(index, 'estimatedMinutes', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Commands Sub-Section */}
              <div className="bg-slate-950/60 rounded-lg p-3 space-y-3 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5" /> Runnable Commands / Scripts
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddCommand(index)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Command
                  </button>
                </div>

                {step.commands?.map((cmd, cmdIdx) => (
                  <div key={cmd.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-slate-900 p-2.5 rounded border border-slate-800">
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        placeholder="Label (e.g. Check Status)"
                        value={cmd.label}
                        onChange={(e) => handleUpdateCommand(index, cmdIdx, 'label', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Env (e.g. Production)"
                        value={cmd.environment || ''}
                        onChange={(e) => handleUpdateCommand(index, cmdIdx, 'environment', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <input
                        type="text"
                        placeholder="command (e.g. kubectl rollout restart...)"
                        value={cmd.command}
                        onChange={(e) => handleUpdateCommand(index, cmdIdx, 'command', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-emerald-400"
                      />
                    </div>
                    <div className="md:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveCommand(index, cmdIdx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};
