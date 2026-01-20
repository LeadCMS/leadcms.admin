import { lazy } from "react";

const UnsubscribesModule = lazy(() =>
  import("./index").then((module) => ({ default: module.UnsubscribesModule }))
);

export { UnsubscribesModule };

