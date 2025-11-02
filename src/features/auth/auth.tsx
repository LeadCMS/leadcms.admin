import { Routes, Route, Navigate } from "react-router-dom";

import { Login } from "./login";
import { ForgotPassword } from "./forgot-password";
import { ResetPassword } from "./reset-password";
import { DeviceVerify } from "./device-verify";

export const Auth = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="device-verify" element={<DeviceVerify />} />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};
