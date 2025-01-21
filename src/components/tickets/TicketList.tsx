import { useEffect } from 'react';
import { useTicketStore } from '@/stores/ticketStore';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export function TicketList() {
  const { tickets, loading, error, fetchTickets, selectTicket } = useTicketStore();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (loading) {
    return <div className="flex items-center justify-center p-4">Loading tickets...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 p-4">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => selectTicket(ticket)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{ticket.title}</h3>
              <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {ticket.description}
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>#{ticket.id}</span>
              <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
            </div>
          </Card>
        ))}
        {tickets.length === 0 && (
          <div className="text-center text-muted-foreground p-4">
            No tickets found
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'open':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'destructive';
    default:
      return 'outline';
  }
} 