import { Routes, Route, Navigate } from "react-router-dom";

import {Login} from "./login";


export const AuthModule = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};
