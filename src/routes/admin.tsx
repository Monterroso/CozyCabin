/**
 * admin.tsx
 * Admin-specific route configuration
 */

import { lazy } from "react";
import type { AppRoute } from "./config";
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminOverviewPage from "@/pages/dashboards/AdminOverviewPage";
import AdminConsole from "@/pages/admin/AdminConsole";

const InvitesPage = lazy(() => import("@/pages/admin/InvitesPage"));
const TicketManagementPage = lazy(() => import("@/pages/tickets/AgentTicketListPage"));

export const adminRoutes: AppRoute[] = [
  {
    path: "/admin",
    element: AdminLayout,
    protected: true,
    allowedRoles: ['admin'],
    children: [
      {
        path: "dashboard",
        element: AdminOverviewPage,
        protected: true,
        allowedRoles: ['admin'],
      },
      {
        path: "invites",
        element: InvitesPage,
        protected: true,
        allowedRoles: ['admin'],
      },
      {
        path: "console",
        element: AdminConsole,
        protected: true,
        allowedRoles: ['admin'],
      },
      {
        path: "tickets",
        element: TicketManagementPage,
        protected: true,
        allowedRoles: ['admin'],
      },
      // Add other admin routes here
    ],
  },
]; 