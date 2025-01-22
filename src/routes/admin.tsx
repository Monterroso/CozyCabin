import { lazy } from "react";
import { Route } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";

const InvitesPage = lazy(() => import("@/pages/admin/InvitesPage"));

export const adminRoutes = (
  <Route element={<AdminLayout />}>
    <Route path="invites" element={<InvitesPage />} />
    {/* Add other admin routes here */}
  </Route>
); 