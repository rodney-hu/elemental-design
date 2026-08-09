import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Showcase } from "./Showcase";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Showcase />
  </React.StrictMode>,
);
