import { addFormRoute, editFormRoute, viewFormRoute } from "@lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { UnsubscribesList } from "./list";
import { UnsubscribeFormPage } from "./form";

export const UnsubscribesModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<UnsubscribesList />} />
        <Route path={editFormRoute.template} element={<UnsubscribeFormPage mode="edit" />} />
        <Route path={viewFormRoute.template} element={<UnsubscribeFormPage mode="view" />} />
        <Route path={addFormRoute.template} element={<UnsubscribeFormPage mode="create" />} />
      </Routes>
      <Outlet />
    </>
  );
};
