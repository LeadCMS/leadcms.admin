import { CoreModule, getCoreModuleRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { BreadcrumbLink } from "types";

export const modelName = "redirect";
export const searchLabel = "Search redirects";
export const defaultFilterOrderColumn = "createdAt";
export const defaultFilterOrderDirection = "desc";
export const redirectGridSettingsStorageKey = "redirectDataListSettings";
export const redirectListPageBreadcrumb = "Redirects";

export const redirectFormBreadcrumbLinks: BreadcrumbLink[] = [
  ...dataListBreadcrumbLinks,
  {
    linkText: redirectListPageBreadcrumb,
    toRoute: getCoreModuleRoute(CoreModule.redirects),
  },
];

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  InternalPath: "Internal Path",
  ContentSlug: "Content Slug",
  ContentId: "Content ID",
};

export const TARGET_TYPE_LABELS: Record<string, string> = {
  ExternalUrl: "External URL",
  InternalPath: "Internal Path",
  ContentSlug: "Content Slug",
  ContentId: "Content ID",
};

export const KIND_LABELS: Record<string, string> = {
  Temporary: "Temporary (302)",
  Permanent: "Permanent (301)",
};
