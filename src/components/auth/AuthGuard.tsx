import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/types/supabase'

const PUBLIC_ROUTES = ['/auth/login', '/auth/signup', '/auth/reset-password']

interface AuthGuardProps {
  children: React.ReactNode | ((props: { user: User | null }) => React.ReactNode)
  requireAuth?: boolean
  allowedRoles?: UserRole[]
}

export function AuthGuard({ children, requireAuth = true, allowedRoles }: AuthGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, isLoading, initialized, initialize, cleanup } = useAuthStore()

  // Initialize auth state only once when component mounts
  useEffect(() => {
    if (!initialized) {
      initialize()
    }
    return cleanup
  }, []) // Empty dependency array since we only want this to run once

  // Handle routing based on auth state
  useEffect(() => {
    if (!initialized || isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)

    if (!user && requireAuth && !isPublicRoute) {
      // Redirect to login if trying to access protected route without auth
      navigate('/auth/login', { 
        replace: true,
        state: { from: location }
      })
    } else if (user && isPublicRoute) {
      // If user is logged in and tries to access public route,
      // redirect to appropriate dashboard based on role
      if (profile?.role) {
        navigate(`/dashboard/${profile.role}`, { replace: true })
      } else {
        navigate('/dashboard/customer', { replace: true })
      }
    } else if (user && profile && allowedRoles && !allowedRoles.includes(profile.role)) {
      // Handle role-based access control
      navigate(`/dashboard/${profile.role}`, { replace: true })
    }
  }, [user, profile?.role, location.pathname, initialized, isLoading, allowedRoles]) 

  // Show nothing while loading or initializing
  if (isLoading || !initialized) {
    return null
  }

  // Handle render prop pattern
  if (typeof children === 'function') {
    return <>{children({ user })}</>
  }

  // Handle regular children
  return <>{children}</>
} 