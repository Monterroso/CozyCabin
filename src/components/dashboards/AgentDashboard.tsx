/**
 * AgentDashboard.tsx
 * Dashboard component for support agents to manage and track tickets
 * 
 * This component provides a comprehensive dashboard interface for support agents
 * to monitor ticket queues, track performance metrics, and manage assigned tickets.
 * It includes sections for active tickets, performance statistics, and quick actions.
 * 
 * Features:
 * - Real-time ticket queue monitoring
 * - Performance metrics visualization
 * - Quick access to assigned and unassigned tickets
 * - Accessible interface with ARIA labels
 * - Responsive layout design
 * 
 * @example
 * ```tsx
 * <AgentDashboard />
 * ```
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/hooks/useSupabase'
import { useToast } from '@/components/ui/use-toast'
import { ticketStatuses } from '@/lib/schemas/ticket'

type TicketStatus = typeof ticketStatuses[number]

interface AgentStats {
  assigned_tickets: number
  resolved_today: number
  average_response_time: number
  satisfaction_rate: number
}

interface ActiveTicket {
  id: string
  subject: string
  status: TicketStatus
  priority: string
  created_at: string
  last_updated: string
}

/**
 * AgentDashboard Component
 * 
 * A dashboard component that displays ticket management tools and performance
 * metrics for support agents. Integrates with Supabase for data fetching and
 * provides quick access to ticket management features.
 * 
 * @returns {JSX.Element} A dashboard interface for support agents
 */
export function AgentDashboard() {
  const [stats, setStats] = useState<AgentStats>({
    assigned_tickets: 0,
    resolved_today: 0,
    average_response_time: 0,
    satisfaction_rate: 0,
  })
  const [activeTickets, setActiveTickets] = useState<ActiveTicket[]>([])
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const navigate = useNavigate()

  /**
   * Fetches agent performance metrics and active tickets
   * Updates the dashboard state with the retrieved data
   */
  const fetchDashboardData = async () => {
    try {
      const { data: agentStats, error: statsError } = await supabase
        .rpc('get_agent_performance_stats')

      if (statsError) throw statsError

      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, subject, status, priority, created_at, last_updated')
        .eq('assigned_to', (await supabase.auth.getUser()).data.user?.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10)

      if (ticketsError) throw ticketsError

      setStats(agentStats)
      setActiveTickets(tickets)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <main 
      role="main" 
      aria-labelledby="dashboard-title"
      className="p-6 space-y-6"
    >
      <h1 id="dashboard-title" className="text-3xl font-bold">
        Agent Dashboard
      </h1>

      {/* Performance Metrics */}
      <section 
        aria-label="Performance Metrics" 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Assigned Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.assigned_tickets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.resolved_today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.round(stats.average_response_time)} min
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.round(stats.satisfaction_rate * 100)}%
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section aria-label="Quick Actions" className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
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

      {/* Active Tickets */}
      <section aria-label="Active Tickets" className="space-y-4">
        <h2 className="text-xl font-semibold">Active Tickets</h2>
        <div role="list" className="space-y-4">
          {activeTickets.map((ticket) => (
            <Card 
              key={ticket.id}
              role="listitem"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="cursor-pointer hover:bg-accent transition-colors"
            >
              <CardHeader>
                <CardTitle className="text-lg">{ticket.subject}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-x-4">
                    <span className="capitalize">{ticket.status}</span>
                    <span className="capitalize text-primary">{ticket.priority}</span>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    <div>Created: {new Date(ticket.created_at).toLocaleDateString()}</div>
                    <div>Updated: {new Date(ticket.last_updated).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
} 