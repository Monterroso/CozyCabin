import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { CustomerDashboard } from './pages/dashboards/CustomerDashboard';
import { AgentDashboard } from './pages/dashboards/AgentDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lodge-brown">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={`/dashboard/${user.role || 'customer'}`} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            user ? (
              <Navigate to={`/dashboard/${user.role || 'customer'}`} replace />
            ) : (
              <SignUpPage />
            )
          } 
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
        
        {/* Landing page with auth check */}
        <Route path="/" element={
          user ? (
            <Navigate to={`/dashboard/${user.role || 'customer'}`} replace />
          ) : (
            <Layout>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-lodge-brown mb-4">
                  Welcome to CozyCabin
                </h2>
                <p className="text-pine-green-700 mb-8">
                  Your modern customer support solution
                </p>
                <div className="space-x-4">
                  <a
                    href="/login"
                    className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup"
                    className="inline-block px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90"
                  >
                    Sign Up
                  </a>
                </div>
              </div>
            </Layout>
          )
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 