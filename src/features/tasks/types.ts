export type TaskCategory =
  | "data-sync"
  | "maintenance"
  | "reporting"
  | "enrichment"
  | "email"
  | "cleanup"
  | "other";

export interface TaskMetadata {
  displayName: string;
  description: string;
  category: TaskCategory;
}

export interface TaskExecutionLog {
  id: string;
  taskName: string;
  status: "success" | "failed" | "running";
  startedAt: string;
  duration: number | null;
  triggeredBy: "schedule" | "manual";
  error?: string;
}
