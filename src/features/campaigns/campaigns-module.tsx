import { lazy, Suspense } from "react";
import { addFormRoute, editFormRoute, viewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { Campaigns } from "./index";

const CampaignAdd = lazy(() => import("./add").then((m) => ({ default: m.CampaignAdd })));
const CampaignEdit = lazy(() => import("./edit").then((m) => ({ default: m.CampaignEdit })));
const CampaignView = lazy(() => import("./view").then((m) => ({ default: m.CampaignView })));

export const CampaignsModule = () => {
  return (
    <>
      <Suspense fallback={null}>
        <Routes>
          <Route index element={<Campaigns />} />
          <Route path={addFormRoute.template} element={<CampaignAdd />} />
          <Route path={editFormRoute.template} element={<CampaignEdit />} />
          <Route path={viewFormRoute.template} element={<CampaignView />} />
        </Routes>
      </Suspense>
      <Outlet />
    </>
  );
};
