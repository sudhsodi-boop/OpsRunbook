import React from 'react';
import { ShieldAlert, BookOpen, PlayCircle, Bell, BarChart2, RefreshCw, Activity } from 'lucide-react';
import { useRunbookStore } from '../store/useRunbookStore';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, activeSessions, alerts, resetToDefaults } = useRunbookStore();

  const activeSessionCount = activeSessions.length;
  const openAlertCount = alerts.filter(a => a.status === 'open').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('playbooks')}>
            <div className="bg-gradient-to-tr from-indigo-600 to-emerald-500 p-2 rounded-lg shadow-md">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">OpsRunbook</span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Incident Response & Event Playbooks</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('playbooks')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'playbooks'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Playbooks Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('runner')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                activeTab === 'runner'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>Active Incidents</span>
              {activeSessionCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {activeSessionCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alert Simulator</span>
              {openAlertCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {openAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden md:inline">Post-Mortem & Analytics</span>
            </button>
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (confirm('Reset store to default demo playbooks & alerts?')) {
                  resetToDefaults();
                }
              }}
              title="Reset Demo Data"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="hidden lg:flex items-center space-x-1 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Cluster: Production-East</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
