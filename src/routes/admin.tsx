/**
 * admin.tsx
 * Admin-specific route configuration
 */

import { lazy } from "react";
import type { AppRoute } from "./config";
import { AdminLayout } from "@/components/layout/AdminLayout";

const InvitesPage = lazy(() => import("@/pages/admin/InvitesPage"));

export const adminRoutes: AppRoute[] = [
  {
    path: "/admin",
    element: AdminLayout,
    protected: true,
    allowedRoles: ['admin'],
    children: [
      {
        path: "invites",
        element: InvitesPage,
        protected: true,
        allowedRoles: ['admin'],
      },
      // Add other admin routes here
    ],
  },
]; 