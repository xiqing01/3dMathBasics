import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/extend.js";
import App from "./App.jsx";
import "./il8n.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<div></div>}>
      <App />
    </Suspense>
  </StrictMode>
);
