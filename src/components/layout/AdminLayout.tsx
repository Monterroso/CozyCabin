import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";

const adminNavItems = [
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
        <Outlet />
      </main>
    </div>
  );
} 