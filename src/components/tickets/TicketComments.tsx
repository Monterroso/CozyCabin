import { useEffect, useState } from 'react';
import { useTicketStore } from '@/stores/ticketStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/types/supabase';

type TicketComment = Database['public']['Tables']['ticket_comments']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

export function TicketComments() {
  const { selectedTicket } = useTicketStore();
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTicket) {
      fetchComments();
    }
  }, [selectedTicket]);

  const fetchComments = async () => {
    if (!selectedTicket) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTicket) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {comment.profiles.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 