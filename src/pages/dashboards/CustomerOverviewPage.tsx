/**
 * CustomerOverviewPage.tsx
 * Main overview page for customers to see their tickets and activity
 */

import { useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTicketStore } from '@/stores/ticketStore'

export default function CustomerOverviewPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tickets, fetchTickets, loading } = useTicketStore()

  useEffect(() => {
    if (user) {
      fetchTickets({ customer_id: user.id })
    }
  }, [user])

  const activeTickets = tickets.filter(t => t.status === 'open').length
  const recentTickets = tickets.filter(t => {
    const updated = new Date(t.updated_at || t.created_at)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return updated > dayAgo
  }).length

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
              <p className="text-3xl font-bold" aria-label={`${activeTickets} active tickets`}>{activeTickets}</p>
              <p className="text-sm text-muted-foreground">Open tickets requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" aria-label={`${recentTickets} recent updates`}>{recentTickets}</p>
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
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading tickets...</div>
                ) : tickets.slice(0, 5).map((ticket) => (
                  <div 
                    key={ticket.id}
                    role="listitem"
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        Updated {new Date(ticket.updated_at || ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      aria-label={`View ticket: ${ticket.subject}`}
                    >
                      View
                    </Button>
                  </div>
                ))}
                {!loading && tickets.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">No tickets found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </DashboardLayout>
  )
} 