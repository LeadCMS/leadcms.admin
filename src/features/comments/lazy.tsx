import { lazy } from "react";

const CommentsModule = lazy(() =>
  import("./index").then((module) => ({ default: module.CommentsModule }))
);

export { CommentsModule };

