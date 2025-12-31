import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "buffer";
import { Buffer } from "buffer";

window.Buffer = Buffer;
window.global = window;
if ("ethereum" in window) {
  (window.ethereum as any).autoRefreshOnNetworkChange = false;
}
ReactDOM.createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
