import { lazy } from "react";

export const ContactsLazy = lazy(() =>
  import("features/contacts").then(({ Contacts }) => ({ default: Contacts })),
);
