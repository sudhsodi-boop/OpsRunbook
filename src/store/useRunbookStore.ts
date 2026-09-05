import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Playbook, ExecutionSession, IncidentEvent, StepStatus, AuditLog } from '../types/runbook';
import { INITIAL_PLAYBOOKS, INITIAL_ALERTS } from '../data/defaultPlaybooks';

const STORAGE_KEY = 'runbook_expo_app_data_v1';

interface StateData {
  playbooks: Playbook[];
  activeSessions: ExecutionSession[];
  completedSessions: ExecutionSession[];
  alerts: IncidentEvent[];
  selectedSessionId: string | null;
  activeTab: 'playbooks' | 'runner' | 'simulator' | 'analytics';
}

interface RunbookStore extends StateData {
  setActiveTab: (tab: 'playbooks' | 'runner' | 'simulator' | 'analytics') => void;
  selectSession: (sessionId: string | null) => void;
  addPlaybook: (playbook: Playbook) => void;
  updatePlaybook: (playbook: Playbook) => void;
  deletePlaybook: (id: string) => void;
  startExecutionSession: (playbookId: string, commander?: string, incidentEventId?: string) => ExecutionSession;
  updateStepStatus: (sessionId: string, stepId: string, status: StepStatus, notes?: string, executedBy?: string) => void;
  addSessionLog: (sessionId: string, action: string, details: string, type?: AuditLog['type']) => void;
  completeExecutionSession: (sessionId: string, postMortemNotes?: string, rootCause?: string) => void;
  cancelExecutionSession: (sessionId: string, reason?: string) => void;
  createSimulatedAlert: (alert: Omit<IncidentEvent, 'id' | 'timestamp' | 'status'>) => IncidentEvent;
  updateAlertStatus: (alertId: string, status: IncidentEvent['status']) => void;
  resetToDefaults: () => void;
  loadSavedData: () => Promise<void>;
}

export const useRunbookStore = create<RunbookStore>((set, get) => {
  const persist = async (newState: Partial<StateData>) => {
    const current = get();
    const dataToSave = {
      playbooks: newState.playbooks ?? current.playbooks,
      activeSessions: newState.activeSessions ?? current.activeSessions,
      completedSessions: newState.completedSessions ?? current.completedSessions,
      alerts: newState.alerts ?? current.alerts,
      selectedSessionId: newState.selectedSessionId ?? current.selectedSessionId,
      activeTab: newState.activeTab ?? current.activeTab,
    };
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }
      if (AsyncStorage && AsyncStorage.setItem) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }
    } catch {
      // ignore
    }
  };
  return {
    playbooks: INITIAL_PLAYBOOKS,
    activeSessions: [],
    completedSessions: [],
    alerts: INITIAL_ALERTS,
    selectedSessionId: null,
    activeTab: 'playbooks',

    loadSavedData: async () => {
      try {
        let saved: string | null = null;
        if (AsyncStorage && AsyncStorage.getItem) {
          saved = await AsyncStorage.getItem(STORAGE_KEY);
        }
        if (!saved && typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          saved = window.localStorage.getItem(STORAGE_KEY);
        }
        if (saved) {
          const parsed = JSON.parse(saved);
          set({
            playbooks: parsed.playbooks || INITIAL_PLAYBOOKS,
            activeSessions: parsed.activeSessions || [],
            completedSessions: parsed.completedSessions || [],
            alerts: parsed.alerts || INITIAL_ALERTS,
            selectedSessionId: parsed.selectedSessionId || null,
            activeTab: parsed.activeTab || 'playbooks'
          });
        }
      } catch {
        // fallback
      }
    },

    setActiveTab: (tab) => { set({ activeTab: tab }); persist({ activeTab: tab }); },
    selectSession: (sessionId) => { set({ selectedSessionId: sessionId }); persist({ selectedSessionId: sessionId }); },
    addPlaybook: (playbook) => { const updated = [playbook, ...get().playbooks]; set({ playbooks: updated }); persist({ playbooks: updated }); },
    updatePlaybook: (playbook) => { const updated = get().playbooks.map((p) => (p.id === playbook.id ? playbook : p)); set({ playbooks: updated }); persist({ playbooks: updated }); },
    deletePlaybook: (id) => { const updated = get().playbooks.filter((p) => p.id !== id); set({ playbooks: updated }); persist({ playbooks: updated }); },

    startExecutionSession: (playbookId, commander = 'Incident Commander', incidentEventId) => {
      const playbook = get().playbooks.find((p) => p.id === playbookId);
      if (!playbook) throw new Error(`Playbook with id ${playbookId} not found`);

      const initialSteps = playbook.steps.map((step) => ({ ...step, status: 'pending' as StepStatus }));
      const newSession: ExecutionSession = {
        id: `session-${Date.now()}`,
        playbookId: playbook.id,
        playbookTitle: playbook.title,
        incidentEventId,
        commander,
        severity: playbook.severity,
        status: 'active',
        startedAt: new Date().toISOString(),
        currentStepIndex: 0,
        steps: initialSteps,
        logs: [{ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), author: commander, action: 'SESSION_STARTED', details: `Started: "${playbook.title}"`, type: 'info' }]
      };

      if (incidentEventId) {
        const updatedAlerts = get().alerts.map(a => a.id === incidentEventId ? { ...a, status: 'investigating' as const } : a);
        set({ alerts: updatedAlerts });
      }

      const updatedSessions = [newSession, ...get().activeSessions];
      set({ activeSessions: updatedSessions, selectedSessionId: newSession.id, activeTab: 'runner' });
      persist({ activeSessions: updatedSessions, selectedSessionId: newSession.id, activeTab: 'runner' });
      return newSession;
    },

    updateStepStatus: (sessionId, stepId, status, notes, executedBy = 'Responder') => {
      const { activeSessions } = get();
      const session = activeSessions.find((s) => s.id === sessionId);
      if (!session) return;

      const now = new Date().toISOString();
      let updatedStepTitle = '';
      const updatedSteps = session.steps.map((step) => {
        if (step.id === stepId) {
          updatedStepTitle = step.title;
          return { ...step, status, notes: notes !== undefined ? notes : step.notes, executedBy, startedAt: status === 'in_progress' ? now : step.startedAt, completedAt: (status === 'completed' || status === 'failed' || status === 'skipped') ? now : step.completedAt };
        }
        return step;
      });

      const newLog: AuditLog = { id: `log-${Date.now()}`, timestamp: now, author: executedBy, action: `STEP_${status.toUpperCase()}`, details: `Step "${updatedStepTitle}" [${status.toUpperCase()}].`, stepId, type: 'info' };
      const updatedSession: ExecutionSession = { ...session, steps: updatedSteps, logs: [newLog, ...session.logs] };
      const updatedActiveSessions = activeSessions.map((s) => (s.id === sessionId ? updatedSession : s));
      set({ activeSessions: updatedActiveSessions });
      persist({ activeSessions: updatedActiveSessions });
    },

    addSessionLog: (sessionId, action, details, type = 'info') => {
      const { activeSessions } = get();
      const session = activeSessions.find((s) => s.id === sessionId);
      if (!session) return;
      const newLog: AuditLog = { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), author: session.commander, action, details, type };
      const updatedSession = { ...session, logs: [newLog, ...session.logs] };
      const updatedActiveSessions = activeSessions.map((s) => (s.id === sessionId ? updatedSession : s));
      set({ activeSessions: updatedActiveSessions });
      persist({ activeSessions: updatedActiveSessions });
    },

    completeExecutionSession: (sessionId, postMortemNotes, rootCause) => {
      const { activeSessions, completedSessions, alerts } = get();
      const session = activeSessions.find((s) => s.id === sessionId);
      if (!session) return;
      const endedAt = new Date().toISOString();
      const completedSession: ExecutionSession = { ...session, status: 'completed', endedAt, postMortemNotes, rootCause, logs: [{ id: `log-${Date.now()}`, timestamp: endedAt, author: session.commander, action: 'SESSION_RESOLVED', details: `Completed successfully.`, type: 'success' }, ...session.logs] };
      let updatedAlerts = alerts;
      if (session.incidentEventId) { updatedAlerts = alerts.map((a) => a.id === session.incidentEventId ? { ...a, status: 'resolved' as const } : a); }
      const updatedActive = activeSessions.filter((s) => s.id !== sessionId);
      const updatedCompleted = [completedSession, ...completedSessions];
      set({ activeSessions: updatedActive, completedSessions: updatedCompleted, alerts: updatedAlerts, selectedSessionId: completedSession.id });
      persist({ activeSessions: updatedActive, completedSessions: updatedCompleted, alerts: updatedAlerts, selectedSessionId: completedSession.id });
    },

    cancelExecutionSession: (sessionId, reason = 'Cancelled') => {
      const { activeSessions, completedSessions } = get();
      const session = activeSessions.find((s) => s.id === sessionId);
      if (!session) return;
      const endedAt = new Date().toISOString();
      const cancelledSession: ExecutionSession = { ...session, status: 'cancelled', endedAt, logs: [{ id: `log-${Date.now()}`, timestamp: endedAt, author: session.commander, action: 'SESSION_CANCELLED', details: reason, type: 'warning' }, ...session.logs] };
      const updatedActive = activeSessions.filter((s) => s.id !== sessionId);
      const updatedCompleted = [cancelledSession, ...completedSessions];
      set({ activeSessions: updatedActive, completedSessions: updatedCompleted, selectedSessionId: cancelledSession.id });
      persist({ activeSessions: updatedActive, completedSessions: updatedCompleted, selectedSessionId: cancelledSession.id });
    },

    createSimulatedAlert: (alertData) => {
      const newAlert: IncidentEvent = { ...alertData, id: `alert-${Date.now()}`, timestamp: new Date().toISOString(), status: 'open' };
      const updatedAlerts = [newAlert, ...get().alerts];
      set({ alerts: updatedAlerts });
      persist({ alerts: updatedAlerts });
      return newAlert;
    },

    updateAlertStatus: (alertId, status) => {
      const updatedAlerts = get().alerts.map((a) => (a.id === alertId ? { ...a, status } : a));
      set({ alerts: updatedAlerts });
      persist({ alerts: updatedAlerts });
    },

    resetToDefaults: () => {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') { window.localStorage.removeItem(STORAGE_KEY); }
      if (AsyncStorage && AsyncStorage.removeItem) { AsyncStorage.removeItem(STORAGE_KEY); }
      set({ playbooks: INITIAL_PLAYBOOKS, activeSessions: [], completedSessions: [], alerts: INITIAL_ALERTS, selectedSessionId: null, activeTab: 'playbooks' });
    }
  };
});
