// src/main.tsx  (or main.jsx)

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // <- important
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      {" "}
      {/* <‑‑ Router provider */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
