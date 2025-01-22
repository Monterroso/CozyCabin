/**
 * CustomerDashboard.tsx
 * Main dashboard view for customers to see their tickets and activity
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  TicketIcon,
  Clock,
  MessageSquare,
  Settings2,
} from 'lucide-react'
import { Plus } from 'lucide-react'

export default function CustomerDashboard() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <main role="main" aria-labelledby="dashboard-title">
        <div className="mb-8 flex items-center justify-between">
          <h1 id="dashboard-title" className="text-3xl font-bold">Welcome Back!</h1>
          <Button 
            onClick={() => navigate('/tickets/new')}
            aria-label="Create new support ticket"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Ticket
          </Button>
        </div>

        <section 
          aria-label="Dashboard Overview"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>Active Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" aria-label="3 active tickets">3</p>
              <p className="text-sm text-muted-foreground">Open tickets requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" aria-label="2 recent updates">2</p>
              <p className="text-sm text-muted-foreground">Updates in the last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" aria-label="2 hour average response time">2h</p>
              <p className="text-sm text-muted-foreground">Average response time</p>
            </CardContent>
          </Card>
        </section>

        {/* Recent Tickets Section */}
        <section aria-labelledby="recent-tickets-title" className="mt-8">
          <h2 id="recent-tickets-title" className="mb-4 text-xl font-semibold">Recent Tickets</h2>
          <Card>
            <CardContent className="p-0">
              <div 
                className="divide-y"
                role="list"
                aria-label="Recent tickets list"
              >
                <div 
                  role="listitem"
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <h3 className="font-medium">Login Issue with Mobile App</h3>
                    <p className="text-sm text-muted-foreground">Updated 2 hours ago</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/tickets/1')}
                    aria-label="View ticket: Login Issue with Mobile App"
                  >
                    View
                  </Button>
                </div>
                <div 
                  role="listitem"
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <h3 className="font-medium">Payment Failed</h3>
                    <p className="text-sm text-muted-foreground">Updated 5 hours ago</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/tickets/2')}
                    aria-label="View ticket: Payment Failed"
                  >
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </DashboardLayout>
  )
} 