import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-pine-green-600">Loading...</p>
      </div>
    );
  }

  if (user) {
    const role = user.user_metadata.role || 'customer';
    
    // Redirect based on user role
    switch (role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'agent':
        return <Navigate to="/agent/dashboard" replace />;
      default:
        return <Navigate to="/dashboard/customer" replace />; // Redirect customers to their dashboard
    }
  }

  return <>{children}</>;
} 