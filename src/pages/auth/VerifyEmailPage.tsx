import { useLocation, Navigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <Layout>
      <div className="flex items-center justify-center py-10">
        <div className="container max-w-lg">
          <Card className="w-full p-8 shadow-lg bg-white text-center">
            <h2 className="text-2xl font-bold text-lodge-brown mb-4">Check Your Email</h2>
            <p className="text-pine-green-600 mb-4">
              We've sent a verification link to <span className="font-medium">{email}</span>
            </p>
            <p className="text-sm text-pine-green-500">
              Click the link in the email to verify your account. If you don't see it, check your spam folder.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 