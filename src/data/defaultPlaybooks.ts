import type { Playbook, IncidentEvent } from '../types/runbook';

export const INITIAL_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-db-failover',
    title: 'PostgreSQL Primary Database Failover',
    description: 'Procedure to promote standby replica to primary when main database suffers hardware failure, replication crash, or disk exhaustion.',
    category: 'Database',
    severity: 'P1',
    tags: ['database', 'postgresql', 'failover', 'high-availability'],
    serviceName: 'Core Database Cluster',
    estimatedTotalMinutes: 15,
    author: 'Site Reliability Engineering',
    version: '2.1.0',
    updatedAt: new Date().toISOString(),
    prerequisites: [
      'Access to AWS RDS / Patroni CLI with cluster admin privileges',
      'Confirm replication status is within safe lag threshold (< 100MB)',
      'Notify #incident-channel in Slack'
    ],
    steps: [
      {
        id: 'step-1',
        order: 1,
        title: 'Assess Replication Lag & Health',
        description: 'Verify current replication lag on standby instances before initiating failover.',
        estimatedMinutes: 2,
        isRequired: true,
        verificationCriteria: 'Replication lag should be under 5 seconds or 100MB WAL.',
        commands: [
          {
            id: 'cmd-1',
            label: 'Check Replica Status',
            command: 'patronictl -c /etc/patroni/patroni.yml list',
            environment: 'Database Bastion'
          }
        ]
      },
      {
        id: 'step-2',
        order: 2,
        title: 'Trigger Managed Failover',
        description: 'Execute failover command or switch RDS primary instance to candidate node.',
        estimatedMinutes: 5,
        isRequired: true,
        verificationCriteria: 'New node responds as Leader with read/write mode active.',
        commands: [
          {
            id: 'cmd-2',
            label: 'Execute Switchover',
            command: 'patronictl -c /etc/patroni/patroni.yml switchover --master db-node-01 --candidate db-node-02 --force',
            environment: 'Database Bastion'
          }
        ]
      },
      {
        id: 'step-3',
        order: 3,
        title: 'Redirect Application Connections & DNS',
        description: 'Update Route53 database endpoint alias or verify PgBouncer auto-reconnect.',
        estimatedMinutes: 3,
        isRequired: true,
        verificationCriteria: 'PgBouncer connection pool reports zero active error sessions.',
        commands: [
          {
            id: 'cmd-3',
            label: 'Reload PgBouncer Configuration',
            command: 'pgb-console -c "RELOAD;" && pgb-console -c "SHOW POOLS;"',
            environment: 'PgBouncer Host'
          }
        ]
      },
      {
        id: 'step-4',
        order: 4,
        title: 'Validate Application Read/Write Health',
        description: 'Run healthcheck synthetic query from application gateway.',
        estimatedMinutes: 5,
        isRequired: true,
        verificationCriteria: 'HTTP 200 OK returned on /health/db-status endpoint.',
        commands: [
          {
            id: 'cmd-4',
            label: 'Run Synthetic Health Query',
            command: 'curl -s https://api.internal/health/db-status | jq .',
            environment: 'App Gateway'
          }
        ]
      }
    ]
  },
  {
    id: 'pb-memory-leak',
    title: 'High CPU / Memory Leak Emergency Mitigation',
    description: 'Diagnose and mitigate runaway memory consumption or 100% CPU lockups in microservice clusters.',
    category: 'Infrastructure',
    severity: 'P2',
    tags: ['kubernetes', 'memory-leak', 'oom', 'microservices'],
    serviceName: 'API Gateway Service',
    estimatedTotalMinutes: 10,
    author: 'Platform Ops',
    version: '1.4.2',
    updatedAt: new Date().toISOString(),
    prerequisites: [
      'Kubectl cluster access with namespaces permissions',
      'Grafana Dashboard link for pod memory metrics'
    ],
    steps: [
      {
        id: 'step-mem-1',
        order: 1,
        title: 'Identify Thrashing Pods',
        description: 'Find pods exceeding 90% memory limits or experiencing OOMKilled restarts.',
        estimatedMinutes: 2,
        isRequired: true,
        commands: [
          {
            id: 'cmd-mem-1',
            label: 'Get High Memory Pods',
            command: 'kubectl top pods -n production --sort-by=memory | head -n 10',
            environment: 'Kubernetes Cluster'
          }
        ]
      },
      {
        id: 'step-mem-2',
        order: 2,
        title: 'Capture Heap Dump / Diagnostics',
        description: 'Trigger node heap dump download to persistent storage before pod restart for root cause analysis.',
        estimatedMinutes: 3,
        isRequired: false,
        commands: [
          {
            id: 'cmd-mem-2',
            label: 'Trigger Remote Heapdump',
            command: 'kubectl exec -it deployment/api-gateway -n production -- node --heapdump /tmp/heap.heapsnapshot',
            environment: 'Kubernetes Pod'
          }
        ]
      },
      {
        id: 'step-mem-3',
        order: 3,
        title: 'Perform Rolling Restart',
        description: 'Restart pods sequentially to release leaked RAM without dropping user traffic.',
        estimatedMinutes: 5,
        isRequired: true,
        commands: [
          {
            id: 'cmd-mem-3',
            label: 'Restart Deployment',
            command: 'kubectl rollout restart deployment/api-gateway -n production',
            environment: 'Kubernetes Cluster'
          }
        ]
      }
    ]
  },
  {
    id: 'pb-sec-containment',
    title: 'Security Incident: Compromised Credentials / Token Containment',
    description: 'Immediate quarantine procedures for suspected leaked API keys, tokens, or compromised IAM user permissions.',
    category: 'Security',
    severity: 'P1',
    tags: ['security', 'credentials', 'iam', 'containment'],
    serviceName: 'IAM & Authentication',
    estimatedTotalMinutes: 12,
    author: 'InfoSec Team',
    version: '3.0.1',
    updatedAt: new Date().toISOString(),
    prerequisites: [
      'AWS Security Admin credentials',
      'Okta / Auth0 Security Operations Access'
    ],
    steps: [
      {
        id: 'step-sec-1',
        order: 1,
        title: 'Revoke Active User Sessions & API Tokens',
        description: 'Invalidate all JWT refresh tokens and kill active sessions for compromised accounts.',
        estimatedMinutes: 3,
        isRequired: true,
        commands: [
          {
            id: 'cmd-sec-1',
            label: 'Global Revoke User Tokens',
            command: 'aws iam deactivate-access-key --access-key-id AKIAIOSFODNN7EXAMPLE --user-name compromised-user',
            environment: 'AWS CLI Security'
          }
        ]
      },
      {
        id: 'step-sec-2',
        order: 2,
        title: 'Attach DenyAll Security Guardrail Policy',
        description: 'Quarantine compromised IAM Role or User with immediate DenyAll inline policy.',
        estimatedMinutes: 2,
        isRequired: true,
        commands: [
          {
            id: 'cmd-sec-2',
            label: 'Attach Emergency Isolation Policy',
            command: 'aws iam put-user-policy --user-name compromised-user --policy-name EmergencyQuarantine --policy-document file://security/deny-all.json',
            environment: 'AWS Security Console'
          }
        ]
      },
      {
        id: 'step-sec-3',
        order: 3,
        title: 'Rotate Secrets in Key Vault',
        description: 'Generate fresh API secret keys and sync to HashiCorp Vault.',
        estimatedMinutes: 7,
        isRequired: true,
        commands: [
          {
            id: 'cmd-sec-3',
            label: 'Rotate Secret in Vault',
            command: 'vault kv put secret/production/api-gateway-key value=$(openssl rand -base64 32)',
            environment: 'Vault Server'
          }
        ]
      }
    ]
  },
  {
    id: 'pb-cicd-rollback',
    title: 'Emergency Deployment Rollback Procedure',
    description: 'Rollback broken service deployment to last known stable release artifact upon spike in 5xx HTTP responses.',
    category: 'Deployment',
    severity: 'P2',
    tags: ['deployment', 'cicd', 'rollback', 'release'],
    serviceName: 'Checkout Service',
    estimatedTotalMinutes: 8,
    author: 'Release Operations',
    version: '1.1.0',
    updatedAt: new Date().toISOString(),
    prerequisites: [
      'GitHub Actions / ArgoCD operator access',
      'Verified stable commit SHA from recent release log'
    ],
    steps: [
      {
        id: 'step-rb-1',
        order: 1,
        title: 'Freeze CI/CD Deployment Pipeline',
        description: 'Pause automated merge queues and disable auto-deployments.',
        estimatedMinutes: 1,
        isRequired: true,
        commands: [
          {
            id: 'cmd-rb-1',
            label: 'Pause ArgoCD Sync',
            command: 'argocd app set checkout-service --sync-policy none',
            environment: 'ArgoCD CLI'
          }
        ]
      },
      {
        id: 'step-rb-2',
        order: 2,
        title: 'Rollback Deployment to Target Revision',
        description: 'Execute instant Kubernetes rollback or trigger GitOps revert commit.',
        estimatedMinutes: 4,
        isRequired: true,
        commands: [
          {
            id: 'cmd-rb-2',
            label: 'Kubectl Rollback Undo',
            command: 'kubectl rollout undo deployment/checkout-service -n production',
            environment: 'Production Cluster'
          }
        ]
      },
      {
        id: 'step-rb-3',
        order: 3,
        title: 'Verify Error Rate Normalization',
        description: 'Monitor HTTP 5xx error rate on Datadog for 3 consecutive minutes.',
        estimatedMinutes: 3,
        isRequired: true,
        commands: [
          {
            id: 'cmd-rb-3',
            label: 'Check Error Metrics',
            command: 'curl -s "https://api.datadoghq.com/api/v1/query?query=sum:trace.http.request.errors{service:checkout-service}" -H "DD-API-KEY: $DD_API_KEY"',
            environment: 'Datadog Endpoint'
          }
        ]
      }
    ]
  }
];

export const INITIAL_ALERTS: IncidentEvent[] = [
  {
    id: 'alert-101',
    title: 'Database connection pool exhausted (PgBouncer high latency)',
    description: 'Connection pool saturation reached 98% with rising query waiting queue depth.',
    service: 'Core Database Cluster',
    severity: 'P1',
    source: 'Datadog',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    matchedPlaybookId: 'pb-db-failover',
    status: 'open',
    payload: { host: 'db-primary-01.internal', open_connections: 498, max_connections: 500 }
  },
  {
    id: 'alert-102',
    title: 'API Gateway Pod OOMKilled in production',
    description: 'Memory footprint exceeded 2Gi threshold on api-gateway-7df864f-x82',
    service: 'API Gateway Service',
    severity: 'P2',
    source: 'AWS CloudWatch',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    matchedPlaybookId: 'pb-memory-leak',
    status: 'open',
    payload: { pod: 'api-gateway-7df864f-x82', memory_usage: '2.14 GiB', restart_count: 3 }
  },
  {
    id: 'alert-103',
    title: 'Anomalous AWS IAM Access Key Usage from Untrusted Subnet',
    description: 'Deactivated AWS IAM access key used from IP 198.51.100.44',
    service: 'IAM & Authentication',
    severity: 'P1',
    source: 'Sentry',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    matchedPlaybookId: 'pb-sec-containment',
    status: 'investigating',
    payload: { user: 'ci-runner-service-account', ip: '198.51.100.44' }
  }
];
