import { lazy } from "react";

const LinksModule = lazy(() =>
  import("./index").then((module) => ({ default: module.LinksModule }))
);

export { LinksModule };

