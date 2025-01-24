import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { useTicketStore } from '@/stores/ticketStore'
import { AgentTicketQueue } from '@/components/tickets/AgentTicketQueue'
import { useAuth } from '@/hooks/useAuth'

export default function AgentTicketListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { fetchTickets, loading } = useTicketStore()
  const { user } = useAuth()

  // Determine if we're viewing assigned or unassigned tickets
  const isUnassigned = location.pathname === '/tickets/unassigned'

  useEffect(() => {
    if (!user) return
    
    const filters = {
      assigned_to: isUnassigned ? null : user.id
    }
    
    fetchTickets(filters)
  }, [user, isUnassigned])

  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-lodge-brown">
              {isUnassigned ? 'Unassigned Tickets' : 'My Assigned Tickets'}
            </h1>
            <p className="text-twilight-gray">
              {isUnassigned 
                ? 'View and claim unassigned support tickets'
                : 'View and manage tickets assigned to you'
              }
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant={isUnassigned ? 'outline' : 'default'}
              onClick={() => navigate('/tickets/assigned')}
              className={!isUnassigned ? 'bg-lodge-brown text-cabin-cream hover:bg-lodge-brown/90' : ''}
            >
              My Tickets
            </Button>
            <Button
              variant={isUnassigned ? 'default' : 'outline'}
              onClick={() => navigate('/tickets/unassigned')}
              className={isUnassigned ? 'bg-lodge-brown text-cabin-cream hover:bg-lodge-brown/90' : ''}
            >
              Unassigned Queue
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-pine-green"></div>
          </div>
        ) : (
          <AgentTicketQueue />
        )}
      </main>
    </DashboardLayout>
  )
} 