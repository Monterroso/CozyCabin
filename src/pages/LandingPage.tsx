import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-4xl font-bold text-lodge-brown mb-4">
          Welcome to CozyCabin
        </h1>
        <p className="text-lg text-pine-green-700 mb-8 max-w-2xl mx-auto">
          Your modern customer support solution that brings warmth and efficiency to every interaction.
          Experience support that feels like home.
        </p>
        <div className="space-x-4">
          <Button asChild variant="default">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-cabin-cream-50 rounded-lg">
            <h3 className="text-xl font-semibold text-lodge-brown mb-2">
              Effortless Support
            </h3>
            <p className="text-pine-green-700">
              Streamlined ticket management and intuitive interface for both customers and agents.
            </p>
          </div>
          <div className="p-6 bg-cabin-cream-50 rounded-lg">
            <h3 className="text-xl font-semibold text-lodge-brown mb-2">
              Real-time Updates
            </h3>
            <p className="text-pine-green-700">
              Stay informed with instant notifications and live status updates on your support tickets.
            </p>
          </div>
          <div className="p-6 bg-cabin-cream-50 rounded-lg">
            <h3 className="text-xl font-semibold text-lodge-brown mb-2">
              Smart Analytics
            </h3>
            <p className="text-pine-green-700">
              Make data-driven decisions with comprehensive reporting and insights.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 