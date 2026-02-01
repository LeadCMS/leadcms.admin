import type {
  DeploymentDetailsDto,
  DeploymentRecordDto,
  DeploymentStatsDto,
  DeploymentTargetDto,
  DeploymentStepDto as ApiDeploymentStepDto,
  TimeSpan,
} from "@lib/network/swagger-client";

export type DeploymentStatus = "Pending" | "InProgress" | "Completed" | "Failed" | "Cancelled";

export type {
  DeploymentDetailsDto,
  DeploymentRecordDto,
  DeploymentStatsDto,
  DeploymentTargetDto,
  TimeSpan,
};

export type DeploymentStepDto = ApiDeploymentStepDto & {
  url?: string | null;
  logsUrl?: string | null;
};

// Duration can be either a TimeSpan object or a string from the backend
export type Duration = TimeSpan | string | null | undefined;
