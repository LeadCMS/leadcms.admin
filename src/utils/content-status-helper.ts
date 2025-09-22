/**
 * Content status utility functions
 */

export type ContentStatus = "Draft" | "Published" | "Planned";

export interface ContentStatusInfo {
  status: ContentStatus;
  color: "warning" | "success" | "info";
  tooltip?: string;
}

/**
 * Determines the status of content based on its publishedAt date
 * @param publishedAt The published at date string or null
 * @returns Content status information including status, color, and tooltip
 */
export const getContentStatus = (publishedAt: string | null): ContentStatusInfo => {
  if (!publishedAt) {
    return {
      status: "Draft",
      color: "warning",
    };
  }

  const publishedDate = new Date(publishedAt);
  const now = new Date();

  if (publishedDate > now) {
    return {
      status: "Planned",
      color: "info",
      tooltip: `Scheduled for ${publishedDate.toLocaleDateString()}`,
    };
  }

  return {
    status: "Published",
    color: "success",
    tooltip: `Published on ${publishedDate.toLocaleDateString()}`,
  };
};

/**
 * Get a formatted tooltip title for the content status
 * @param publishedAt The published at date string or null
 * @returns Formatted tooltip string or empty string
 */
export const getContentStatusTooltip = (publishedAt: string | null): string => {
  if (!publishedAt) {
    return "";
  }

  const publishedDate = new Date(publishedAt);
  const now = new Date();

  if (publishedDate > now) {
    return `Scheduled for ${publishedDate.toLocaleDateString()}`;
  }

  return `Published on ${publishedDate.toLocaleDateString()}`;
};
