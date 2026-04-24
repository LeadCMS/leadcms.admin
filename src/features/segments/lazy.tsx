import { lazy } from "react";

const SegmentsModule = lazy(() =>
  import("./segments-module").then((module) => ({ default: module.SegmentsModule }))
);

export { SegmentsModule };

