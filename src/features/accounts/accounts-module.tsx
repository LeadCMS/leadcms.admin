import { getAddFormRoute, getEditFormRoute, getViewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { AccountAdd } from "./add";
import { AccountEdit } from "./edit";
import { AccountsLazy } from "./lazy";
import { AccountViewBase } from "./view";
import { AccountView } from "./view/details";

export const AccountsModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<AccountsLazy />} />
        <Route path={getEditFormRoute()} element={<AccountEdit />} />
        <Route path={getViewFormRoute()} element={<AccountViewBase />}>
          <Route index element={<AccountView />} />
          <Route path="details" element={<AccountView />} />
        </Route>
        <Route path={getAddFormRoute()} element={<AccountAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};
