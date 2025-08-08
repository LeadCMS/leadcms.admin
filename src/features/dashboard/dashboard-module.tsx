import { useRequestContext } from "@providers/request-provider";
import { Outlet, Route, Routes, Navigate } from "react-router-dom";
import { Dashboard } from ".";
import { useConfig } from "@providers/config-provider";
import { getDashboardAvailability } from "@features/dashboard/availability";
import { defaultModuleRoute } from "@lib/router";

export const DashboardModule = () => {
  useRequestContext(); // for possible future use
  const { config, loading } = useConfig();
  const availability = getDashboardAvailability(config?.entities);

  if (!loading && !availability.hasAny) {
    return <Navigate to={defaultModuleRoute} replace />;
  }

  return (
    <>
      <Routes>
        <Route index element={<Dashboard />} />
      </Routes>
      <Outlet />
    </>
  );
};
