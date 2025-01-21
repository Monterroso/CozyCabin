import { Layout } from '@/components/layout/Layout';
import { TicketList } from '@/components/tickets/TicketList';
import { TicketDetails } from '@/components/tickets/TicketDetails';
import { TicketComments } from '@/components/tickets/TicketComments';

export function AgentDashboard() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-lodge-brown mb-6">Agent Dashboard</h2>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <TicketList />
          </div>
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <TicketDetails />
            <TicketComments />
          </div>
        </div>
      </div>
    </Layout>
  );
} 