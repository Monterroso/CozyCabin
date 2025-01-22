import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold text-lodge-brown mb-4">Access Denied</h1>
        <p className="text-lg text-pine-green-600 mb-8 max-w-md">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <div className="space-x-4">
          <Button
            variant="default"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </div>
      </div>
    </Layout>
  );
} 