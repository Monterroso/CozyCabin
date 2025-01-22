import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { useTicketStore } from '@/stores/ticketStore'
import { TicketList } from '@/components/tickets/TicketList'

export default function TicketListPage() {
  const navigate = useNavigate()
  const { fetchTickets, loading } = useTicketStore()

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-lodge-brown">My Tickets</h1>
            <p className="text-twilight-gray">View and manage your support tickets</p>
          </div>
          <Button
            onClick={() => navigate('/tickets/new')}
            className="bg-lodge-brown text-cabin-cream hover:bg-lodge-brown/90"
          >
            Create New Ticket
          </Button>
        </div>

        {loading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-pine-green"></div>
          </div>
        ) : (
          <TicketList />
        )}
      </main>
    </DashboardLayout>
  )
} 