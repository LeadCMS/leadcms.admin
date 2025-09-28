import dayjs from "dayjs";

export interface PublicationStatusInfo {
  shouldShowDialog: boolean;
  currentStatus: "draft" | "published" | "planned";
  reason: string;
}

/**
 * Determines whether to show the publication status dialog based on the publishedAt date
 */
export const shouldShowPublicationDialog = (publishedAt: string | null): PublicationStatusInfo => {
  if (!publishedAt) {
    return {
      shouldShowDialog: true,
      currentStatus: "draft",
      reason: "Content has no published date and will be saved as draft",
    };
  }

  const publishDate = dayjs(publishedAt);
  const now = dayjs();

  if (publishDate.isAfter(now)) {
    return {
      shouldShowDialog: true,
      currentStatus: "planned",
      reason: "Content is scheduled for future publication",
    };
  }

  // Content is published (current or past date)
  return {
    shouldShowDialog: false,
    currentStatus: "published",
    reason: "Content has a valid publication date",
  };
};
