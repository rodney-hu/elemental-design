import * as React from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "elemental-design/overlay";
import "./index.css";
import { Showcase } from "./Showcase";

/* ToastProvider wraps the app once, near the root — mounting it per page is
   how toasts end up firing twice. */
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <Showcase />
    </ToastProvider>
  </React.StrictMode>,
);
