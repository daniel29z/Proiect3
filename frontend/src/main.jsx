// Aici am importat React, ReactDOM, BrowserRouter si componenta principala App
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// Aici am montat aplicatia React in elementul #root din index.html
// BrowserRouter permite navigarea intre pagini fara refresh
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
