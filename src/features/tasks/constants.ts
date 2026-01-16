import type { TaskMetadata, TaskCategory } from "./types";

export const TASK_METADATA: Record<string, TaskMetadata> = {
  SyncIpDetailsTask: {
    displayName: "IP Details Sync",
    description: "Synchronizes IP address geolocation and details",
    category: "data-sync",
  },
  DomainVerificationTask: {
    displayName: "Domain Verification",
    description: "Verifies domain ownership and DNS configuration",
    category: "maintenance",
  },
  ContactScheduledEmailTask: {
    displayName: "Scheduled Email Delivery",
    description: "Processes and sends scheduled emails to contacts",
    category: "email",
  },
  ContactAccountTask: {
    displayName: "Contact Account Sync",
    description: "Synchronizes contact data with associated accounts",
    category: "data-sync",
  },
  SyncEmailLogTask: {
    displayName: "Email Log Sync",
    description: "Syncs email delivery logs and updates status",
    category: "email",
  },
  EnrichmentSchedulerTask: {
    displayName: "Enrichment Scheduler",
    description: "Schedules contact enrichment jobs",
    category: "enrichment",
  },
  EnrichmentExecutorTask: {
    displayName: "Enrichment Executor",
    description: "Executes contact enrichment with external providers",
    category: "enrichment",
  },
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  "data-sync": "info",
  maintenance: "info",
  reporting: "default",
  enrichment: "secondary",
  email: "primary",
  cleanup: "error",
  other: "default",
};
