/**
 * AdminLayout.tsx
 * Layout component for admin section of the application.
 * Provides navigation and structure for all admin pages.
 */

import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { NavItem } from "@/components/layout/Sidebar";

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "Invites",
    href: "/admin/invites",
    icon: "UserPlus",
  },
  // Add other admin navigation items here
];

export function AdminLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar items={adminNavItems} />
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
} 