import {
  accountDealsRoute,
  detailsRoute,
  addFormRoute,
  editFormRoute,
  viewFormRoute,
} from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { AccountAdd } from "./add";
import { AccountEdit } from "./edit";
import { AccountsLazy } from "./lazy";
import { AccountViewBase } from "./view";
import { AccountDeals } from "./view/deals";
import { AccountView } from "./view/details";

export const AccountsModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<AccountsLazy />} />
        <Route path={editFormRoute.template} element={<AccountEdit />} />
        <Route path={viewFormRoute.template} element={<AccountViewBase />}>
          <Route index element={<AccountView />} />
          <Route path={detailsRoute.template} element={<AccountView />} />
          <Route path={accountDealsRoute.template} element={<AccountDeals />} />
        </Route>
        <Route path={addFormRoute.template} element={<AccountAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};
