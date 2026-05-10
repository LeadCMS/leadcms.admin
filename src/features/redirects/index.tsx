import { Outlet, Route, Routes } from "react-router-dom";
import { RedirectsList } from "./list";

export const RedirectsModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<RedirectsList />} />
      </Routes>
      <Outlet />
    </>
  );
};
