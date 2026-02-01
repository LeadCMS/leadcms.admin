import React from "react";
import { Route, Routes } from "react-router-dom";
import { DeploymentsList } from "./deployment-list";
import { DeploymentDetails } from "./deployment-details";

export const DeploymentsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<DeploymentsList />} />
      <Route path="/:id" element={<DeploymentDetails />} />
    </Routes>
  );
};
