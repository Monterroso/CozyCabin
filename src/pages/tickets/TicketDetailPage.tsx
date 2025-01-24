import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useTicketStore } from '@/stores/ticketStore'
import { useAuth } from '@/hooks/useAuth'
import { AgentTicketManagement } from '@/components/tickets/AgentTicketManagement'
import { CommentList } from '@/components/tickets/comments/CommentList'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusColorMap = {
  'open': 'bg-pine-green/20 text-pine-green',
  'in_progress': 'bg-lodge-brown/20 text-lodge-brown',
  'pending': 'bg-ember-orange/20 text-ember-orange',
  'solved': 'bg-pine-green/20 text-pine-green',
  'closed': 'bg-twilight-gray/20 text-twilight-gray'
} as const;

const priorityColorMap = {
  'normal': 'bg-pine-green/20 text-pine-green',
  'low': 'bg-pine-green/20 text-pine-green',
  'medium': 'bg-lodge-brown/20 text-lodge-brown',
  'high': 'bg-ember-orange/20 text-ember-orange',
  'urgent': 'bg-ember-orange/20 text-ember-orange'
} as const;

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { selectedTicket, selectTicket, loading } = useTicketStore()

  useEffect(() => {
    if (id) {
      selectTicket(id)
    }
    return () => {
      selectTicket(null)
    }
  }, [id, selectTicket])

  if (loading || !selectedTicket) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-twilight-gray">Loading ticket details...</p>
        </div>
      </DashboardLayout>
    )
  }
  
  console.log(user);
  console.log("========================")

  return (
    <DashboardLayout>
      <main className="space-y-8">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-lodge-brown">{selectedTicket.subject}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-twilight-gray">
                <span>Ticket #{selectedTicket.id}</span>
                <span>•</span>
                <span>Created {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={cn('capitalize', statusColorMap[selectedTicket.status])}>
                {selectedTicket.status.replace('_', ' ')}
              </Badge>
              <Badge className={cn('capitalize', priorityColorMap[selectedTicket.priority])}>
                {selectedTicket.priority}
              </Badge>
            </div>
          </div>
          <p className="mt-4 text-twilight-gray">{selectedTicket.description}</p>
        </div>

        <Separator className="bg-twilight-gray/20" />

        {/* Show AgentTicketManagement only for agents */}
        {user?.user_metadata.role === 'agent' && (
          <>
            <AgentTicketManagement ticket={selectedTicket} />
            <Separator className="bg-twilight-gray/20" />
          </>
        )}

        <CommentList ticketId={selectedTicket.id} />
      </main>
    </DashboardLayout>
  )
} 