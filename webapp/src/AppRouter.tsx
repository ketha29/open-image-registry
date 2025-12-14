import React from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import HomePage from "./pages/HomePage";
import RepositoryViewPage from "./pages/RepositoryViewPage";
import LoginPage from "./pages/LoginPage";
import NewAccountSetupPage from "./pages/NewAccountSetupPage";

import RegistryConsolePage from "./pages/console/RegistryConsolePage";
import UserAdministrationPage from "./pages/console/UserAdministrationPage";
import NamespaceAccessPage from "./pages/console/NamespaceAccesPage";
import RepositoryAccessViewPage from "./pages/console/RepositoryAccessViewPage";
import NamespaceAccessViewPage from "./pages/console/NamespaceAccessViewPage";
import UpstreamAccessManagementPage from "./pages/console/UpstreamAccessManagementPage";
import RepositoryAccessPage from "./pages/console/RepositoryAccessPage";

const AppRouter = createBrowserRouter([
  {
    path: "/",
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
            path: "/console",
            element: <RegistryConsolePage />,
            children: [
              {
                path: "/console/user-management/users",
                element: <UserAdministrationPage />

              },
              {
                path: "/console/access-management",
                children: [
                  {
                    path: "/console/access-management/namespaces/:id",
                    element: <NamespaceAccessViewPage />
                  },
                  {
                    path: "/console/access-management/namespaces",
                    element: <NamespaceAccessPage />
                  },
                  {
                    path: "/console/access-management/repositories",
                    element: <RepositoryAccessPage />
                  },
                  {
                    path: "/console/access-management/repositories/:id",
                    element: <RepositoryAccessViewPage />
                  },
                  {
                    path: "/console/access-management/upstreams",
                    element: <UpstreamAccessManagementPage />
                  }
                ]
              }
            ],
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