import { getAddFormRoute, getEditFormRoute, getViewFormRoute } from "@lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { UnsubscribesList } from "./list";
import { UnsubscribeFormPage } from "./form";

export const UnsubscribesModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<UnsubscribesList />} />
        <Route path={getEditFormRoute()} element={<UnsubscribeFormPage mode="edit" />} />
        <Route path={getViewFormRoute()} element={<UnsubscribeFormPage mode="view" />} />
        <Route path={getAddFormRoute()} element={<UnsubscribeFormPage mode="create" />} />
      </Routes>
      <Outlet />
    </>
  );
};
