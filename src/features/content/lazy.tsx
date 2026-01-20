import { lazy } from "react";

const ContentModule = lazy(() =>
  import("./index").then((module) => ({ default: module.ContentModule }))
);

export { ContentModule };

