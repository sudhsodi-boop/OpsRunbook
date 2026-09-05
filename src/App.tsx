import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PlaybookCatalog } from './components/PlaybookCatalog';
import { PlaybookEditor } from './components/PlaybookEditor';
import { IncidentSimulator } from './components/IncidentSimulator';
import { ExecutionRunner } from './components/ExecutionRunner';
import { AnalyticsView } from './components/AnalyticsView';
import { useRunbookStore } from './store/useRunbookStore';
import type { Playbook } from './types/runbook';

export function App() {
  const { activeTab } = useRunbookStore();
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditPlaybook = (playbook?: Playbook) => {
    setEditingPlaybook(playbook);
    setIsEditing(true);
  };

  const handleBackFromEditor = () => {
    setIsEditing(false);
    setEditingPlaybook(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'playbooks' && (
          isEditing ? (
            <PlaybookEditor playbook={editingPlaybook} onBack={handleBackFromEditor} />
          ) : (
            <PlaybookCatalog onEditPlaybook={handleEditPlaybook} />
          )
        )}

        {activeTab === 'runner' && <ExecutionRunner />}

        {activeTab === 'simulator' && <IncidentSimulator />}

        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>OpsRunbook Event Playbook & Incident Automation Engine</span>
          <span>Built for SRE & DevOps Incident Command</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
