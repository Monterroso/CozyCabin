import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./admin";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { UserRole } from "@/lib/types/supabase";

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={['admin'] as UserRole[]}>
        {adminRoutes}
      </ProtectedRoute>
    ),
  },
  // Add other routes here
]); 