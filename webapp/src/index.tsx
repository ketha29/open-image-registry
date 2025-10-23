import React from "react";
import ReactDOM from "react-dom/client";
import { Outlet, RouterProvider } from "react-router-dom";
import AppRouter from "./AppRouter";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "./assets/themes/viva-light/theme.css";
import "./assets/themes/viva-light/custom.css";
import "./index.css";
import RootLayout from "./components/RootLayout";
import { ToastProvider } from "./components/ToastComponent";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ToastProvider>
      <RouterProvider router={AppRouter} />
    </ToastProvider>
  </React.StrictMode>
);
