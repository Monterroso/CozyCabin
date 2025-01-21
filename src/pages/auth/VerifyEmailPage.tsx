import { useLocation, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

export function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/auth/signup" replace />;
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-lodge-brown mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We've sent a verification link to <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in the email to verify your account. If you don't see it, check your spam folder.
          </p>
        </div>
      </div>
    </Layout>
  );
} 