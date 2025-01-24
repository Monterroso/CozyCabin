import { lazy, createElement } from "react";
import type { UserRole } from "@/lib/types/supabase";
import { Navigate } from "react-router-dom";
import type { ComponentType, LazyExoticComponent } from "react";
import { useAuth } from "@/hooks/useAuth";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import CallbackPage from "@/pages/auth/CallbackPage";

// Overview Pages
import CustomerOverviewPage from "@/pages/dashboards/CustomerOverviewPage";
import AgentOverviewPage from "@/pages/dashboards/AgentOverviewPage";
import AdminOverviewPage from "@/pages/dashboards/AdminOverviewPage";

// Ticket Pages
import TicketListPage from "@/pages/tickets/TicketListPage";
import AgentTicketListPage from "@/pages/tickets/AgentTicketListPage";
import CreateTicketPage from "@/pages/tickets/CreateTicketPage";
import TicketDetailPage from "@/pages/tickets/TicketDetailPage";

// Admin Pages
const InvitesPage = lazy(() => import("@/pages/admin/InvitesPage"));

export interface AppRoute {
  path: string;
  element: ComponentType | LazyExoticComponent<ComponentType>;
  protected?: boolean;
  allowedRoles?: UserRole[];
  children?: AppRoute[];
  errorElement?: ComponentType;
  props?: Record<string, unknown>;
}

// Protected Routes
const protectedRoutes: AppRoute[] = [
  // Customer Routes
  {
    path: "/dashboard/customer",
    element: CustomerOverviewPage,
    protected: true,
    allowedRoles: ['customer'],
  },
  {
    path: "/tickets",
    element: TicketListPage,
    protected: true,
    allowedRoles: ['customer'],
  },
  {
    path: "/tickets/new",
    element: CreateTicketPage,
    protected: true,
    allowedRoles: ['customer'],
  },
  {
    path: "/tickets/:id",
    element: TicketDetailPage,
    protected: true,
  },
  
  // Agent Routes
  {
    path: "/dashboard/agent",
    element: AgentOverviewPage,
    protected: true,
    allowedRoles: ['agent', 'admin'],
  },
  {
    path: "/tickets/assigned",
    element: AgentTicketListPage,
    protected: true,
    allowedRoles: ['agent', 'admin'],
  },
  {
    path: "/tickets/unassigned",
    element: AgentTicketListPage,
    protected: true,
    allowedRoles: ['agent', 'admin'],
  },
  
  // Admin Routes
  {
    path: "/dashboard/admin",
    element: AdminOverviewPage,
    protected: true,
    allowedRoles: ['admin'],
  },
];

// Create redirect components
const RootRedirect = () => {
  const { user, profile, isLoading, isInitialized } = useAuth();

  // Don't redirect until auth is fully initialized and not loading
  if (!isInitialized || isLoading) {
    return null; // Or return a loading spinner component if you have one
  }

  // Only redirect to login if we're sure the user is not authenticated
  if (!user || !profile) {
    return createElement(Navigate, { to: "/auth/login", replace: true });
  }

  switch (profile.role) {
    case 'admin':
      return createElement(Navigate, { to: "/dashboard/admin", replace: true });
    case 'agent':
      return createElement(Navigate, { to: "/dashboard/agent", replace: true });
    case 'customer':
    default:
      return createElement(Navigate, { to: "/dashboard/customer", replace: true });
  }
}

const CatchAllRedirect = () => {
  return createElement(Navigate, { to: "/", replace: true });
}

export const routes: AppRoute[] = [
  // Auth Routes
  {
    path: "/auth/login",
    element: LoginPage,
  },
  {
    path: "/auth/signup",
    element: SignUpPage,
  },
  {
    path: "/auth/reset-password",
    element: ResetPasswordPage,
  },
  {
    path: "/auth/callback",
    element: CallbackPage,
  },
  
  // Root redirect
  {
    path: "/",
    element: RootRedirect,
  },
  
  // Add all protected routes
  ...protectedRoutes,
  
  // Catch-all route
  {
    path: "*",
    element: CatchAllRedirect,
  },
]; 