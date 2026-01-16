import React from "react";
import { Route, Routes } from "react-router-dom";
import { TasksList } from "./task-list";

export const TasksModule = () => {
  return (
    <Routes>
      <Route path="/" element={<TasksList />} />
    </Routes>
  );
};
