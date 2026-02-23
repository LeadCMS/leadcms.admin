import { addFormRoute, editFormRoute, viewFormRoute } from "lib/router";
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
        <Route path={addFormRoute.template} element={<CampaignAdd />} />
        <Route path={editFormRoute.template} element={<CampaignEdit />} />
        <Route path={viewFormRoute.template} element={<CampaignView />} />
      </Routes>
      <Outlet />
    </>
  );
};
