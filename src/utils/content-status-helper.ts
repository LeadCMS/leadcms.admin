/**
 * Content status utility functions
 */

export type ContentStatus = "Draft" | "Planned" | "Published" | "New" | "Live" | "Modified";

export const allContentStatuses: ContentStatus[] = [
  "Draft",
  "Planned",
  "Published",
  "New",
  "Live",
  "Modified",
];

/** Statuses available when deployment tracking is configured */
export const deploymentStatuses: ContentStatus[] = ["Draft", "Planned", "New", "Live", "Modified"];

/** Statuses available without deployment tracking */
export const basicStatuses: ContentStatus[] = ["Draft", "Planned", "Published"];

export interface ContentStatusInfo {
  status: ContentStatus;
  color: "warning" | "success" | "info" | "secondary" | "default";
  tooltip?: string;
}

export const getContentStatus = (
  publishedAt: string | null,
  updatedAt?: string | null,
  lastReleaseDate?: string | null,
  createdAt?: string | null
): ContentStatusInfo => {
  const fmtDate = (d: Date) => d.toLocaleDateString();
  const fmtDateTime = (d: Date) =>
    d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (!publishedAt) {
    return {
      status: "Draft",
      color: "warning",
      tooltip:
        "Still in draft. This content will not be deployed or appear on the site " +
        "until a publish date is set.",
    };
  }

  const publishedDate = new Date(publishedAt);
  const now = new Date();

  if (publishedDate > now) {
    return {
      status: "Planned",
      color: "info",
      tooltip: lastReleaseDate
        ? "Scheduled to become available on " +
          fmtDate(publishedDate) +
          ". Will go live after the next deployment. Last deployment: " +
          fmtDateTime(new Date(lastReleaseDate))
        : "Scheduled to become available on " + fmtDate(publishedDate),
    };
  }

  if (!lastReleaseDate) {
    return {
      status: "Published",
      color: "success",
      tooltip:
        "Became published on " +
        fmtDate(publishedDate) +
        ". Set Last Release Date in Settings to track deployment status.",
    };
  }

  const releaseDate = new Date(lastReleaseDate);
  const createdDate = createdAt ? new Date(createdAt) : null;

  // publishedAt can be manually backdated before the record was created.
  // Use createdAt when it's later — content can't be live before it exists.
  const effectiveDate = createdDate && createdDate > publishedDate ? createdDate : publishedDate;

  const updatedDate = updatedAt ? new Date(updatedAt) : null;
  const latestChange = updatedDate && updatedDate > effectiveDate ? updatedDate : effectiveDate;

  // Content that effectively became available after the last deployment
  if (effectiveDate > releaseDate) {
    return {
      status: "New",
      color: "info",
      tooltip:
        "Created on " +
        fmtDateTime(effectiveDate) +
        " and is still not deployed. Last deployment: " +
        fmtDateTime(releaseDate) +
        ". Will appear on the site after the next deployment.",
    };
  }

  if (latestChange > releaseDate) {
    const editInfo =
      updatedDate && updatedDate > effectiveDate
        ? "Last edited on " + fmtDateTime(updatedDate)
        : "Published on " + fmtDateTime(effectiveDate);
    return {
      status: "Modified",
      color: "secondary",
      tooltip:
        "Has changes not yet on the site. " +
        editInfo +
        ". Last deployment: " +
        fmtDateTime(releaseDate) +
        ". Changes will appear after the next deployment.",
    };
  }

  return {
    status: "Live",
    color: "success",
    tooltip:
      "This content is live and matches what visitors see. " +
      "Published on " +
      fmtDate(effectiveDate) +
      ", included in the " +
      fmtDateTime(releaseDate) +
      " deployment.",
  };
};

export const getStatusFilterQuery = (
  status: ContentStatus,
  lastReleaseDate?: string | null
): string => {
  const nowISO = new Date().toISOString();

  switch (status) {
    case "Draft":
      return "&filter[where][publishedAt][eq]=";
    case "Planned":
      return `&filter[where][publishedAt][gt]=${nowISO}`;
    case "Published":
      if (lastReleaseDate) return "";
      return `&filter[where][publishedAt][lte]=${nowISO}`;
    case "Live":
      if (!lastReleaseDate) return "";
      return (
        `&filter[where][publishedAt][lte]=${lastReleaseDate}` +
        `&filter[where][createdAt][lte]=${lastReleaseDate}` +
        `&filter[where][updatedAt][lte]=${lastReleaseDate}`
      );
    case "New":
      if (!lastReleaseDate) return "";
      return (
        `&filter[where][publishedAt][lte]=${nowISO}` +
        `&filter[where][createdAt][gt]=${lastReleaseDate}`
      );
    case "Modified":
      if (!lastReleaseDate) return "";
      return (
        `&filter[where][publishedAt][lte]=${lastReleaseDate}` +
        `&filter[where][createdAt][lte]=${lastReleaseDate}` +
        `&filter[where][updatedAt][gt]=${lastReleaseDate}`
      );
    default:
      return "";
  }
};
