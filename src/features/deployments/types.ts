import type {
  DeploymentDetailsDto,
  DeploymentRecordDto,
  DeploymentStatsDto,
  DeploymentTargetDto,
  DeploymentStepDto,
  TimeSpan,
} from "@lib/network/swagger-client";

export type DeploymentStatus = "Pending" | "InProgress" | "Completed" | "Failed" | "Cancelled";

export type {
  DeploymentDetailsDto,
  DeploymentRecordDto,
  DeploymentStatsDto,
  DeploymentTargetDto,
  DeploymentStepDto,
  TimeSpan,
};

// Duration can be either a TimeSpan object or a string from the backend
export type Duration = TimeSpan | string | null | undefined;
