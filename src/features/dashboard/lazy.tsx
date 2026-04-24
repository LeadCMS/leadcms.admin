import { lazy } from "react";

const DashboardModule = lazy(() =>
  import("./dashboard-module").then((module) => ({ default: module.DashboardModule }))
);

export { DashboardModule };
