/**
 * AgentDashboard.tsx
 * Main dashboard view for support agents to manage tickets and view their performance
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Clock, MessageSquare } from 'lucide-react'
import { AgentTicketQueue } from '@/components/tickets/AgentTicketQueue'
import { useTicketStore } from '@/stores/ticketStore'

export default function AgentDashboard() {
  const { agentStats, fetchAgentDashboardData, fetchTickets } = useTicketStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        await Promise.all([
          fetchAgentDashboardData(),
          fetchTickets()
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try again.',
          variant: 'destructive',
        })
      }
    }

    loadDashboard()
  }, [fetchAgentDashboardData, fetchTickets, toast])

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
              <div className="text-2xl font-bold">{agentStats?.assigned_tickets || 0}</div>
              <p className="text-xs text-muted-foreground">Active cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentStats?.resolved_today || 0}</div>
              <p className="text-xs text-muted-foreground">Completed tickets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Response</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(agentStats?.average_response_time || 0)}m</div>
              <p className="text-xs text-muted-foreground">Response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((agentStats?.satisfaction_rate || 0) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section aria-label="Quick Actions" className="mt-8 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate('/tickets/unassigned')}
              aria-label="View unassigned tickets queue"
            >
              Unassigned Queue
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/tickets/assigned')}
              aria-label="View your assigned tickets"
            >
              My Tickets
            </Button>
          </div>
        </section>

        {/* Active Tickets Section */}
        <section aria-labelledby="active-tickets-title">
          <div className="mb-4">
            <h2 id="active-tickets-title" className="text-xl font-semibold">Active Tickets</h2>
          </div>
          <AgentTicketQueue />
        </section>
      </main>
    </DashboardLayout>
  )
} 