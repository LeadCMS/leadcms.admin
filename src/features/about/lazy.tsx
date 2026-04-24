import { lazy } from "react";

const AboutModule = lazy(() =>
  import("./index").then((module) => ({ default: module.AboutModule }))
);

export { AboutModule };

