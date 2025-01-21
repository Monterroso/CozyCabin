/**
 * routes.tsx
 * Application routing configuration with protected routes
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Pages
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignUpPage } from '@/pages/auth/SignUpPage'
import { CustomerDashboard } from '@/pages/dashboards/CustomerDashboard'
import { AgentDashboard } from '@/pages/dashboards/AgentDashboard'
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard'
import { TicketsPage } from '@/pages/TicketsPage'

export function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/tickets" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/tickets" replace /> : <SignUpPage />}
      />

      {/* Protected routes with role-based access */}
      <Route
        path="/dashboard/customer"
        element={
          <ProtectedRoute requiredRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/agent"
        element={
          <ProtectedRoute requiredRole="agent">
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        }
      />

      {/* Landing page */}
      <Route
        path="/"
        element={user ? <Navigate to="/tickets" replace /> : <LandingPage />}
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
} 