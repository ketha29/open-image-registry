import React from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import HomePage from "./pages/HomePage";
import RepositoryViewPage from "./pages/RepositoryViewPage";
import LoginPage from "./pages/LoginPage";
import NewAccountSetupPage from "./pages/NewAccountSetupPage";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    // Component: RootLayout,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/account-setup/:uuid",
        element: <NewAccountSetupPage />,
      },
      {
        path: "/",
        Component: RootLayout,
        children: [
          {
            path: "",
            element: <HomePage />,
            index: true,
          },
          {
            path: "/repository/:repository_name",
            element: <RepositoryViewPage />,
          },
        ],
      },
    ],
  },
]);
export default AppRouter;