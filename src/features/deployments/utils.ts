import type { DeploymentStatus, TimeSpan } from "./types";

export const formatDuration = (duration: TimeSpan | string | null | undefined): string => {
  if (!duration) return "-";

  let ms: number | undefined;

  // Handle string format from backend (e.g., "00:02:14.5325947" or "1.21:48:16.1767973")
  if (typeof duration === "string") {
    try {
      const parts = duration.split(".");
      let timeStr = parts[0];
      let days = 0;

      // Check if there are days (format: "d.HH:mm:ss")
      if (timeStr.includes(".")) {
        const dayParts = timeStr.split(".");
        days = parseInt(dayParts[0], 10);
        timeStr = dayParts[1];
      }

      const timeParts = timeStr.split(":");
      if (timeParts.length >= 3) {
        const hours = parseInt(timeParts[0], 10) + days * 24;
        const minutes = parseInt(timeParts[1], 10);
        const seconds = parseInt(timeParts[2], 10);
        ms = (hours * 3600 + minutes * 60 + seconds) * 1000;
      }
    } catch {
      return "-";
    }
  } else {
    // Handle TimeSpan object
    ms = duration.totalMilliseconds;
  }

  if (ms === null || ms === undefined) return "-";

  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

export const formatShortDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

export const getStatusColor = (
  status: DeploymentStatus | undefined
): "success" | "error" | "warning" | "info" | "default" => {
  switch (status) {
    case "Completed":
      return "success";
    case "Failed":
      return "error";
    case "InProgress":
      return "info";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "default";
    default:
      return "default";
  }
};

export const getStatusLabel = (status: DeploymentStatus | undefined): string => {
  switch (status) {
    case "Completed":
      return "Completed";
    case "Failed":
      return "Failed";
    case "InProgress":
      return "In Progress";
    case "Pending":
      return "Pending";
    case "Cancelled":
      return "Cancelled";
    default:
      return "Unknown";
  }
};

export const getProviderDisplayName = (provider: string | undefined): string => {
  if (!provider) return "Unknown";

  const providerNames: Record<string, string> = {
    azure_static_web_apps: "Azure Static Web Apps",
    azure_blob_storage: "Azure Blob Storage",
    aws_s3: "AWS S3",
    netlify: "Netlify",
    vercel: "Vercel",
    cloudflare_pages: "Cloudflare Pages",
    github_pages: "GitHub Pages",
  };

  return providerNames[provider.toLowerCase()] || provider;
};
