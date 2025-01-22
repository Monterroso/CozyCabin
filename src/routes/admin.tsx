/**
 * admin.tsx
 * Admin-specific route configuration
 */

import { lazy } from "react";
import type { RouteObject } from 'react-router-dom'
import { AdminLayout } from "@/components/layout/AdminLayout";

const InvitesPage = lazy(() => import("@/pages/admin/InvitesPage"));

export const adminRoutes: RouteObject[] = [
  {
    element: <AdminLayout />,
    children: [
      {
        path: "invites",
        element: <InvitesPage />,
      },
      // Add other admin routes here
    ],
  },
]; 