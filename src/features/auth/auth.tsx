import { Routes, Route, Navigate } from "react-router-dom";

import { Login } from "./login";

export const Auth = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};
