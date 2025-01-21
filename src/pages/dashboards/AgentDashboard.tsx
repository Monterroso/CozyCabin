import { Layout } from '../../components/layout/Layout';

export function AgentDashboard() {
  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-lodge-brown mb-6">Agent Dashboard</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-pine-green-700">Welcome to the agent workspace</p>
          {/* Ticket management UI will be added later */}
        </div>
      </div>
    </Layout>
  );
} 