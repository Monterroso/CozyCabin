/**
 * AgentDashboard.tsx
 * Main dashboard view for support agents to manage tickets and view their performance
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, MessageSquare } from 'lucide-react'
import { AgentTicketQueue } from '@/components/tickets/AgentTicketQueue'

export default function AgentDashboard() {
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
          <div className="mb-4">
            <h2 id="active-tickets-title" className="text-xl font-semibold">Active Tickets</h2>
          </div>
          <AgentTicketQueue />
        </section>
      </main>
    </DashboardLayout>
  )
} 