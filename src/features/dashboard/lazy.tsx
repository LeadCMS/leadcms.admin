import { lazy } from "react";

export const DashboardLazy = lazy(() =>
  import("./index").then(({ DashboardModule }) => ({ default: DashboardModule }))
);
