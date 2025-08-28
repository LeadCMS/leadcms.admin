import ReactDOM from "react-dom/client";
import { App } from "./app";
import { SidebarProvider } from "@providers/sidebar-provider";

const rootNode = document.getElementById("root");
if (rootNode) {
  ReactDOM.createRoot(rootNode).render(
    <SidebarProvider>
      <App />
    </SidebarProvider>
  );
}
