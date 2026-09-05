export type Severity = 'P1' | 'P2' | 'P3' | 'P4';

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export type ExecutionStatus = 'active' | 'completed' | 'failed' | 'cancelled';

export interface CommandScript {
  id: string;
  label: string;
  command: string;
  environment?: string; // e.g. 'Production', 'Staging', 'Database'
  description?: string;
}

export interface RunbookStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  isRequired: boolean;
  commands?: CommandScript[];
  verificationCriteria?: string;
  status?: StepStatus;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  executedBy?: string;
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  category: 'Infrastructure' | 'Database' | 'Security' | 'Deployment' | 'Network' | 'Incident Response';
  severity: Severity;
  tags: string[];
  estimatedTotalMinutes: number;
  author: string;
  version: string;
  updatedAt: string;
  steps: RunbookStep[];
  prerequisites?: string[];
  serviceName?: string;
}

export interface IncidentEvent {
  id: string;
  title: string;
  description: string;
  service: string;
  severity: Severity;
  source: 'Datadog' | 'PagerDuty' | 'AWS CloudWatch' | 'Sentry' | 'Manual Alert';
  timestamp: string;
  matchedPlaybookId?: string;
  status: 'open' | 'investigating' | 'mitigated' | 'resolved';
  payload?: Record<string, string | number | boolean>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  details: string;
  stepId?: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface ExecutionSession {
  id: string;
  playbookId: string;
  playbookTitle: string;
  incidentEventId?: string;
  commander: string;
  severity: Severity;
  status: ExecutionStatus;
  startedAt: string;
  endedAt?: string;
  currentStepIndex: number;
  steps: RunbookStep[];
  logs: AuditLog[];
  postMortemNotes?: string;
  rootCause?: string;
}
