import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Dashboard from '../pages/dashboard/Dashboard';
import About from '../pages/About';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import NotFound from '../pages/NotFound';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import UserManage from '../pages/auth/userManage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import Profile from '../pages/auth/Profile';
const AppRoutes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/about",
      element: (
        <DashboardLayout>
          <About />
        </DashboardLayout>
      ),
    },
    {
      path: "/users",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <UserManage />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: "*",
      element: (
        <DashboardLayout>
          <NotFound />
        </DashboardLayout>
      ),
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default AppRoutes;