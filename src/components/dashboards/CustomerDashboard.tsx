/**
 * CustomerDashboard.tsx
 * Dashboard component for customer users to view and manage their tickets
 * 
 * This component provides a personalized dashboard interface for customers
 * to view their ticket history, create new tickets, and track ticket status.
 * It includes sections for recent tickets, ticket statistics, and quick actions.
 * 
 * Features:
 * - Overview of recent tickets
 * - Ticket status statistics
 * - Quick actions for common tasks
 * - Accessible interface with ARIA labels
 * - Responsive layout design
 * 
 * @example
 * ```tsx
 * <CustomerDashboard />
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

interface TicketStats {
  total: number
  open: number
  solved: number
  pending: number
}

interface RecentTicket {
  id: string
  subject: string
  status: TicketStatus
  created_at: string
}

/**
 * CustomerDashboard Component
 * 
 * A dashboard component that displays ticket-related information and actions
 * for customer users. Integrates with Supabase for data fetching and provides
 * navigation to ticket management features.
 * 
 * @returns {JSX.Element} A dashboard interface for customer users
 */
export function CustomerDashboard() {
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    solved: 0,
    pending: 0,
  })
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const navigate = useNavigate()

  /**
   * Fetches ticket statistics and recent tickets for the current user
   * Updates the dashboard state with the retrieved data
   */
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const { data: ticketStats, error: statsError } = await supabase
        .rpc('get_customer_ticket_stats')

      if (statsError) throw statsError

      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, subject, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (ticketsError) throw ticketsError

      setStats(ticketStats)
      setRecentTickets(tickets)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
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
        Customer Dashboard
      </h1>

      {/* Ticket Statistics */}
      <section 
        aria-label="Ticket Statistics" 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Solved Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.solved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section aria-label="Quick Actions" className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate('/tickets/new')}
            aria-label="Create new support ticket"
          >
            Create New Ticket
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/tickets')}
            aria-label="View all tickets"
          >
            View All Tickets
          </Button>
        </div>
      </section>

      {/* Recent Tickets */}
      <section aria-label="Recent Tickets" className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Tickets</h2>
        <div role="list" className="space-y-4">
          {recentTickets.map((ticket) => (
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
                  <span className="capitalize">{ticket.status}</span>
                  <span className="text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
} 