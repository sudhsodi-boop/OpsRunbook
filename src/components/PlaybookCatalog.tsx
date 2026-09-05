import React, { useState } from 'react';
import { Search, Plus, Play, Clock, Tag, Filter, Layers, FileText, Trash2, Edit3 } from 'lucide-react';
import { useRunbookStore } from '../store/useRunbookStore';
import type { Playbook, Severity } from '../types/runbook';

interface PlaybookCatalogProps {
  onEditPlaybook: (playbook?: Playbook) => void;
}

export const PlaybookCatalog: React.FC<PlaybookCatalogProps> = ({ onEditPlaybook }) => {
  const { playbooks, startExecutionSession, deletePlaybook } = useRunbookStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');

  const categories = ['All', 'Infrastructure', 'Database', 'Security', 'Deployment', 'Network', 'Incident Response'];
  const severities = ['All', 'P1', 'P2', 'P3', 'P4'];

  const filteredPlaybooks = playbooks.filter((pb) => {
    const matchesSearch =
      pb.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pb.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pb.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || pb.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'All' || pb.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'P1':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'P2':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'P3':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'P4':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            Operational Runbooks & Playbooks
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Standardized incident response procedures, step-by-step recovery commands, and audit-ready playbooks.
          </p>
        </div>
        <button
          onClick={() => onEditPlaybook()}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Playbook</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search playbooks by title, tag, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-3 flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {severities.map((s) => (
              <option key={s} value={s}>
                Severity Target: {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Playbook Cards Grid */}
      {filteredPlaybooks.length === 0 ? (
        <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">No Playbooks Found</h3>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search query or create a new playbook template.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPlaybooks.map((pb) => (
            <div
              key={pb.id}
              className="bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between hover:shadow-lg group"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${getSeverityBadge(
                        pb.severity
                      )}`}
                    >
                      {pb.severity}
                    </span>
                    <span className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded">
                      {pb.category}
                    </span>
                    {pb.serviceName && (
                      <span className="text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/50 px-2 py-0.5 rounded">
                        {pb.serviceName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditPlaybook(pb)}
                      title="Edit Playbook"
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete playbook "${pb.title}"?`)) {
                          deletePlaybook(pb.id);
                        }
                      }}
                      title="Delete Playbook"
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {pb.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {pb.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {pb.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center text-xs text-slate-400 bg-slate-900/60 border border-slate-700/50 px-2 py-0.5 rounded"
                    >
                      <Tag className="w-3 h-3 mr-1 text-slate-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Meta & Action */}
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>~{pb.estimatedTotalMinutes} min</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>{pb.steps.length} Steps</span>
                  </span>
                </div>

                <button
                  onClick={() => startExecutionSession(pb.id)}
                  className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-md transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Runbook</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
