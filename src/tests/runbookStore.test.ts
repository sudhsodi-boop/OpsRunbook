import { describe, it, expect, beforeEach } from 'vitest';
import { useRunbookStore } from '../store/useRunbookStore';

describe('Runbook Store Actions & Execution Engine', () => {
  beforeEach(() => {
    useRunbookStore.getState().resetToDefaults();
  });

  it('loads default playbooks and simulated alerts', () => {
    const state = useRunbookStore.getState();
    expect(state.playbooks.length).toBeGreaterThan(0);
    expect(state.alerts.length).toBeGreaterThan(0);
    expect(state.playbooks[0].title).toContain('PostgreSQL');
  });

  it('allows adding and editing playbooks', () => {
    const store = useRunbookStore.getState();
    const newPb = {
      id: 'test-pb',
      title: 'Custom Kubernetes Pod Rollout',
      description: 'Test description',
      category: 'Infrastructure' as const,
      severity: 'P2' as const,
      tags: ['k8s'],
      estimatedTotalMinutes: 5,
      author: 'Tester',
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 's-1',
          order: 1,
          title: 'Verify Cluster',
          description: 'Run status query',
          estimatedMinutes: 2,
          isRequired: true
        }
      ]
    };

    store.addPlaybook(newPb);
    expect(useRunbookStore.getState().playbooks.some((p) => p.id === 'test-pb')).toBe(true);
  });

  it('launches an execution session and updates step status', () => {
    const store = useRunbookStore.getState();
    const pbId = store.playbooks[0].id;

    const session = store.startExecutionSession(pbId, 'Commander Alex');
    expect(session).toBeDefined();
    expect(session.status).toBe('active');
    expect(session.steps.length).toBeGreaterThan(0);

    const firstStepId = session.steps[0].id;
    store.updateStepStatus(session.id, firstStepId, 'completed', 'Verified replica lag is 0ms');

    const updatedSession = useRunbookStore.getState().activeSessions.find((s) => s.id === session.id);
    expect(updatedSession?.steps[0].status).toBe('completed');
    expect(updatedSession?.steps[0].notes).toBe('Verified replica lag is 0ms');
    expect(updatedSession?.logs.some((l) => l.action.includes('COMPLETED'))).toBe(true);
  });

  it('simulates alerts and matches playbooks', () => {
    const store = useRunbookStore.getState();
    const alert = store.createSimulatedAlert({
      title: 'PostgreSQL Primary Database Failover',
      description: 'Lag warning',
      service: 'Core Database Cluster',
      severity: 'P1',
      source: 'Datadog',
      matchedPlaybookId: 'pb-db-failover'
    });

    expect(alert.id).toBeDefined();
    expect(alert.matchedPlaybookId).toBe('pb-db-failover');
  });

  it('completes an execution session and generates post-mortem log record', () => {
    const store = useRunbookStore.getState();
    const pbId = store.playbooks[0].id;
    const session = store.startExecutionSession(pbId);

    store.completeExecutionSession(session.id, 'Executed according to runbook', 'Primary node power failure');

    const completed = useRunbookStore.getState().completedSessions.find((s) => s.id === session.id);
    expect(completed).toBeDefined();
    expect(completed?.status).toBe('completed');
    expect(completed?.rootCause).toBe('Primary node power failure');
  });
});
