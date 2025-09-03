import { Outlet, Route, Routes } from "react-router-dom";
import Settings from "./index";

export const SettingsModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<Settings />} />
      </Routes>
      <Outlet />
    </>
  );
};
