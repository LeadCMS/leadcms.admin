import { getAddFormRoute, getEditFormRoute, getViewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { OrderAdd } from "./add";
import { OrderEdit } from "./edit";
import { OrdersLazy } from "./lazy";
import { OrderViewBase } from "./view";
import { OrderView } from "./view/details";
import { OrderItems } from "./view/items";

export const OrdersModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<OrdersLazy />} />
        <Route path={getEditFormRoute()} element={<OrderEdit />} />
        <Route path={getViewFormRoute()} element={<OrderViewBase />}>
          <Route index element={<OrderView />} />
          <Route path={getViewFormRoute()} element={<OrderView />} />
          <Route path="items" element={<OrderItems />} />
        </Route>
        <Route path={getAddFormRoute()} element={<OrderAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};
