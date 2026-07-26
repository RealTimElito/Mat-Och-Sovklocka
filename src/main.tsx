import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/clock" replace />} />
        <Route path="/clock" element={<App />} />
        <Route path="/schedule" element={<App />} />
        <Route path="/settings" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
