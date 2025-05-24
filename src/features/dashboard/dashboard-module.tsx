import { useRequestContext } from "@providers/request-provider";
import { Outlet, Route, Routes } from "react-router-dom";
import { Dashboard } from ".";

export const DashboardModule = () => {
  useRequestContext(); // for possible future use

  return (
    <>
      <Routes>
        <Route index element={<Dashboard />} />
      </Routes>
      <Outlet />
    </>
  );
};
