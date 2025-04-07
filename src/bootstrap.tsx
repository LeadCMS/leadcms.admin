import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";

const rootNode = document.getElementById("root");
if (rootNode) {
  ReactDOM.createRoot(rootNode).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
