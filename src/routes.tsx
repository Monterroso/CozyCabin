/**
 * routes.tsx
 * Application routing configuration with protected routes
 */

import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, isRouteErrorResponse, useRouteError } from "react-router-dom";
import type { UserRole } from "@/lib/types/supabase";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { Toaster } from '@/components/ui/toaster'

// Lazy load pages
const SignUpPage = lazy(() => import("@/pages/auth/SignUpPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const CallbackPage = lazy(() => import("@/pages/auth/CallbackPage"));
const AdminDashboard = lazy(() => import("@/pages/dashboards/AdminDashboard"));
const AgentDashboard = lazy(() => import("@/pages/dashboards/AgentDashboard"));
const CustomerDashboard = lazy(() => import("@/pages/dashboards/CustomerDashboard"));
const TicketsPage = lazy(() => import("@/pages/TicketsPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const InvitesPage = lazy(() => import("@/pages/admin/InvitesPage"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <p className="text-muted-foreground">Loading...</p>
  </div>
);

// Error boundary component
function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">Oops! {error.status}</h1>
        <p className="text-xl mb-4">{error.statusText}</p>
        <p className="text-muted-foreground mb-8">{error.data?.message}</p>
        <a href="/" className="text-blue-500 hover:text-blue-700">
          Go back home
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-muted-foreground mb-8">Please try again later</p>
      <a href="/" className="text-blue-500 hover:text-blue-700">
        Go back home
      </a>
    </div>
  );
}

const Root = ({ children }: { children: React.ReactNode }) => (
  <SupabaseProvider>
    {children}
    <Toaster />
  </SupabaseProvider>
);

const LoginComponent = () => (
  <Root>
    <Suspense fallback={<LoadingFallback />}>
      <LoginPage />
    </Suspense>
  </Root>
);

const SignUpComponent = () => (
  <Root>
    <Suspense fallback={<LoadingFallback />}>
      <SignUpPage />
    </Suspense>
  </Root>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root><Suspense fallback={<LoadingFallback />}><LandingPage /></Suspense></Root>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginComponent />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth/login",
    element: <LoginComponent />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/signup",
    element: <SignUpComponent />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUpComponent />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth/callback",
    element: <Root><Suspense fallback={<LoadingFallback />}><CallbackPage /></Suspense></Root>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard/admin",
    element: (
      <Root>
        <Suspense fallback={<LoadingFallback />}>
          <ProtectedRoute allowedRoles={['admin'] as UserRole[]}>
            <AdminDashboard />
          </ProtectedRoute>
        </Suspense>
      </Root>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard/agent",
    element: (
      <Root>
        <Suspense fallback={<LoadingFallback />}>
          <ProtectedRoute allowedRoles={['agent'] as UserRole[]}>
            <AgentDashboard />
          </ProtectedRoute>
        </Suspense>
      </Root>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard/customer",
    element: (
      <Root>
        <Suspense fallback={<LoadingFallback />}>
          <ProtectedRoute allowedRoles={['customer'] as UserRole[]}>
            <CustomerDashboard />
          </ProtectedRoute>
        </Suspense>
      </Root>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/tickets",
    element: (
      <Root>
        <Suspense fallback={<LoadingFallback />}>
          <ProtectedRoute allowedRoles={['admin', 'agent'] as UserRole[]}>
            <TicketsPage />
          </ProtectedRoute>
        </Suspense>
      </Root>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin/invites",
    element: (
      <Root>
        <Suspense fallback={<LoadingFallback />}>
          <ProtectedRoute allowedRoles={['admin'] as UserRole[]}>
            <InvitesPage />
          </ProtectedRoute>
        </Suspense>
      </Root>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "*",
    element: <ErrorBoundary />,
  }
]); 