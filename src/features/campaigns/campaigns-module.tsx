import { getAddFormRoute, getEditFormRoute, getViewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { Campaigns } from "./index";
import { CampaignAdd } from "./add";
import { CampaignEdit } from "./edit";
import { CampaignView } from "./view";

export const CampaignsModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<Campaigns />} />
        <Route path={getAddFormRoute()} element={<CampaignAdd />} />
        <Route path={getEditFormRoute()} element={<CampaignEdit />} />
        <Route path={getViewFormRoute()} element={<CampaignView />} />
      </Routes>
      <Outlet />
    </>
  );
};
