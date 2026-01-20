import { lazy } from "react";

const ActivityLogModule = lazy(() =>
  import("./index").then((module) => ({ default: module.ActivityLogModule }))
);

export { ActivityLogModule };

