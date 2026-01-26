export const CoreModule = {
  dashboard: "dashboard",
  contacts: "contacts",
  links: "links",
  comments: "comments",
  content: "content",
  media: "media",
  accounts: "accounts",
  orders: "orders",
  deals: "deals",
  domains: "domains",
  segments: "segments",
  unsubscribes: "unsubscribes",
  users: "users",
  about: "about",
  emailTemplates: "email-templates",
  activityLogs: "activity-logs",
  settings: "settings",
  tasks: "tasks",
  deployments: "deployments",
  campaigns: "campaigns",
  sequences: "sequences",
} as const;

export type CoreModuleType = typeof CoreModule[keyof typeof CoreModule];

// Route parameter types for use with React Router's useParams<T>()
// Note: URL params are always strings, so we parse them when needed
// Using Record type to satisfy React Router's type constraints
export type ModuleRouteParams = {
  moduleName?: string;
};

export type IdRouteParams = {
  id?: string;
};

export type ModuleWithIdRouteParams = ModuleRouteParams & IdRouteParams;

// Simple type-safe route builders
export const getCoreModuleRoute = (moduleName: CoreModuleType) => `/${moduleName}`;

/**
 * Returns a route path for editing a form.
 * @param id - Optional ID. If provided, returns actual path (e.g., "123/edit").
 *             If not provided, returns route template (e.g., ":id/edit") for use in route definitions.
 */
export const getEditFormRoute = (id?: number): string => {
  return id !== undefined ? `${id}/edit` : ":id/edit";
};

/**
 * Returns a route path for viewing a form.
 * @param id - Optional ID. If provided, returns actual path (e.g., "123/view").
 *             If not provided, returns route template (e.g., ":id/view") for use in route definitions.
 */
export const getViewFormRoute = (id?: number): string => {
  return id !== undefined ? `${id}/view` : ":id/view";
};

export const getAddFormRoute = () => "add";

export const getImportFormRoute = () => "import";

export const rootRoute = "/";

export const defaultModuleRoute = "/content";
