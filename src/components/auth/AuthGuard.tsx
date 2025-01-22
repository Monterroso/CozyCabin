import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@supabase/supabase-js'

const PUBLIC_ROUTES = ['/auth/login', '/auth/signup', '/auth/reset-password']

interface AuthGuardProps {
  children: React.ReactNode | ((props: { user: User | null }) => React.ReactNode)
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, isLoading, initialized, initialize } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  useEffect(() => {
    if (initialized && !isLoading) {
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
      }
    }
  }, [user, profile, isLoading, initialized, location.pathname, navigate, requireAuth])

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