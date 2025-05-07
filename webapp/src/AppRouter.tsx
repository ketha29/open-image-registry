import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/RootLayout';
import HomePage from './pages/HomePage';
import RepositoryViewPage from './pages/RepositoryViewPage';

const AppRouter = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        path: "",
        element: <HomePage/>,
        index: true,
      },
      {
        path: "/repository/:repository_name",
        element: <RepositoryViewPage/>
      }
    ],
  }
])
export default AppRouter