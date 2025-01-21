import { useEffect, useState } from 'react';
import { useTicketStore } from '@/stores/ticketStore';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import type { TicketStatus, TicketPriority } from '@/lib/types/supabase';

export function TicketDetails() {
  const { user } = useAuth();
  const { selectedTicket, updateTicket, addComment } = useTicketStore();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!selectedTicket) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select a ticket to view details</p>
        </CardContent>
      </Card>
    );
  }

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      setLoading(true);
      await updateTicket(selectedTicket.id, { status });
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    try {
      setLoading(true);
      await updateTicket(selectedTicket.id, { priority });
    } catch (error) {
      console.error('Failed to update ticket priority:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setLoading(true);
      await addComment({
        ticket_id: selectedTicket.id,
        user_id: user?.id || '',
        content: comment,
        is_internal: false,
        attachments: [],
      });
      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{selectedTicket.title}</CardTitle>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>#{selectedTicket.id}</span>
            <span>•</span>
            <span>Created {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}</span>
          </div>
        </div>
        <Badge variant={getStatusVariant(selectedTicket.status)}>
          {selectedTicket.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={selectedTicket.status}
                onValueChange={handleStatusChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={selectedTicket.priority}
                onValueChange={handlePriorityChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {selectedTicket.description}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Add Comment</h3>
          <form onSubmit={handleCommentSubmit}>
            <div className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your comment here..."
                required
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !comment.trim()}>
                {loading ? 'Adding...' : 'Add Comment'}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
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