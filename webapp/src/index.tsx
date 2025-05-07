import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import AppRouter from "./AppRouter";
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import './assets/themes/viva-light/theme.css';
import './assets/themes/viva-light/custom.css';
import './index.css'

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <RouterProvider router={AppRouter} />
  </React.StrictMode>
);
