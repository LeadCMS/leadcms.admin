import type { TaskCategory } from "./types";
import { TASK_METADATA, CATEGORY_COLORS } from "./constants";

export const getTaskMetadata = (taskName: string) => {
  return TASK_METADATA[taskName] || null;
};

export const getTaskCategory = (taskName: string): TaskCategory => {
  return TASK_METADATA[taskName]?.category || "other";
};

export const getCategoryColor = (category: TaskCategory) => {
  return CATEGORY_COLORS[category];
};

export const describeCron = (cronSchedule: string): string => {
  // Simple cron parser for common patterns
  const parts = cronSchedule.split(" ");

  if (cronSchedule === "0 0/1 * * * ?" || cronSchedule === "0 0/1 * * * ? *") {
    return "Every minute";
  }
  if (cronSchedule === "0/10 * * * * ? *") {
    return "Every 10 seconds";
  }
  if (cronSchedule === "0/15 * * * * ? *") {
    return "Every 15 seconds";
  }
  if (cronSchedule === "0/30 * * * * ?" || cronSchedule === "0/30 * * * * ? *") {
    return "Every 30 seconds";
  }
  if (cronSchedule === "0 0 * * * ?") {
    return "Every hour";
  }
  if (cronSchedule === "0 0 0 * * ?") {
    return "Daily at midnight";
  }

  // Default fallback
  return cronSchedule;
};

export const formatDuration = (
  duration: { totalMilliseconds?: number } | number | null | undefined
): string => {
  if (!duration) {
    return "-";
  }

  const ms = typeof duration === "number" ? duration : duration.totalMilliseconds;
  if (ms === null || ms === undefined) {
    return "-";
  }

  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
};
