export const ENTITY_KEYS = {
  account: "account",
  campaign: "campaign",
  contact: "contact",
  deal: "deal",
  domain: "domain",
  emailTemplate: "emailtemplate",
  order: "order",
  segment: "segment",
} as const;

export type EntityKey = (typeof ENTITY_KEYS)[keyof typeof ENTITY_KEYS];

const normalizeEntities = (entities?: string[]) =>
  new Set((entities || []).map((entity) => entity.toLowerCase()));

export const hasEntity = (entities: string[] | undefined, entity: string) => {
  return normalizeEntities(entities).has(entity.toLowerCase());
};

export const hasAllEntities = (entities: string[] | undefined, requiredEntities: string[]) => {
  const entitySet = normalizeEntities(entities);
  return requiredEntities.every((entity) => entitySet.has(entity.toLowerCase()));
};
