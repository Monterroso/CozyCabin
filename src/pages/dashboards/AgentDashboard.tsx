/**
 * AgentDashboard.tsx
 * Main dashboard view for support agents to manage tickets and view their performance
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  TicketIcon,
  Clock,
  TrendingUp,
  MessageSquare,
  Settings2,
} from 'lucide-react'

export default function AgentDashboard() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <main role="main" aria-labelledby="dashboard-title">
        <div className="mb-8">
          <h1 id="dashboard-title" className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">Overview of your support queue and performance</p>
        </div>

        <section 
          aria-label="Performance Metrics"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Tickets</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="12 assigned tickets">12</div>
              <p className="text-xs text-muted-foreground">4 urgent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="8 tickets resolved">8</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Response</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="24 minute average response time">24m</div>
              <p className="text-xs text-muted-foreground">-3m from average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="98 percent satisfaction rate">98%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </section>

        {/* Active Tickets Section */}
        <section aria-labelledby="active-tickets-title" className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="active-tickets-title" className="text-xl font-semibold">Active Tickets</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/agent/tickets')}
              aria-label="View all active tickets"
            >
              View All
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div 
                className="divide-y"
                role="list"
                aria-label="Active tickets list"
              >
                <div 
                  role="listitem"
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex h-2 w-2 rounded-full bg-red-500" 
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-medium">Server Downtime Report</h3>
                      <p className="text-sm text-muted-foreground">Urgent - 5m ago</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/agent/tickets/1')}
                    aria-label="Handle Server Downtime Report ticket"
                  >
                    Handle
                  </Button>
                </div>
                <div 
                  role="listitem"
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex h-2 w-2 rounded-full bg-yellow-500" 
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-medium">Account Access Issue</h3>
                      <p className="text-sm text-muted-foreground">High - 15m ago</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/agent/tickets/2')}
                    aria-label="Handle Account Access Issue ticket"
                  >
                    Handle
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