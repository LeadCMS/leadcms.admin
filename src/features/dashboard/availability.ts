export const CRM_ENTITY_MAP = {
  revenue: ["order"],
  totalOrders: ["order"],
  totalContacts: ["contact"],
  totalAccounts: ["account"],
  salesPerformance: ["order"],
  recentOrders: ["order"],
  contactGrowth: ["contact"],
  topAccounts: ["account"],
} as const;

export const CMS_ENTITY_MAP = {
  // Key metrics
  totalContent: ["content"],
  contentUpdates: ["content"],
  totalMedia: ["media"],
  totalComments: ["comment"],
  // Tiles
  topContent: ["content"],
  contentDistribution: ["content"],
  recentComments: ["comment"],
  recentContent: ["content"],
  contentGrowth: ["content"],
  topAuthors: ["content"],
} as const;

export type DashboardAvailability = ReturnType<typeof getDashboardAvailability>;

export function getDashboardAvailability(entities?: string[]) {
  const list = (entities || []).map((e) => e.toLowerCase());
  const has = (keys: readonly string[]) => keys.some((k) => list.includes(k));

  const crm = {
    revenue: has(CRM_ENTITY_MAP.revenue),
    totalOrders: has(CRM_ENTITY_MAP.totalOrders),
    totalContacts: has(CRM_ENTITY_MAP.totalContacts),
    totalAccounts: has(CRM_ENTITY_MAP.totalAccounts),
    salesPerformance: has(CRM_ENTITY_MAP.salesPerformance),
    recentOrders: has(CRM_ENTITY_MAP.recentOrders),
    contactGrowth: has(CRM_ENTITY_MAP.contactGrowth),
    topAccounts: has(CRM_ENTITY_MAP.topAccounts),
  } as const;

  const cms = {
    // Key metrics
    totalContent: has(CMS_ENTITY_MAP.totalContent),
    contentUpdates: has(CMS_ENTITY_MAP.contentUpdates),
    totalMedia: has(CMS_ENTITY_MAP.totalMedia),
    totalComments: has(CMS_ENTITY_MAP.totalComments),
    // Tiles
    topContent: has(CMS_ENTITY_MAP.topContent),
    contentDistribution: has(CMS_ENTITY_MAP.contentDistribution),
    recentComments: has(CMS_ENTITY_MAP.recentComments),
    recentContent: has(CMS_ENTITY_MAP.recentContent),
    contentGrowth: has(CMS_ENTITY_MAP.contentGrowth),
    topAuthors: has(CMS_ENTITY_MAP.topAuthors),
  } as const;

  const hasCrmTiles = Object.values(crm).some(Boolean);
  const hasCmsTiles = Object.values(cms).some(Boolean);
  const hasAny = hasCrmTiles || hasCmsTiles;

  return { crm, cms, hasCrmTiles, hasCmsTiles, hasAny } as const;
}
