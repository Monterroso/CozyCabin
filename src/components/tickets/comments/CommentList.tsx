import { useState } from 'react'
import { useTicketStore } from '@/stores/ticketStore'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { Send } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'

interface CommentListProps {
  ticketId: string
}

export function CommentList({ ticketId }: CommentListProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { selectedTicketComments, addComment } = useTicketStore()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      await addComment({
        ticket_id: ticketId,
        user_id: user.id,
        content: newComment.trim(),
        is_internal: false,
      })
      setNewComment('')
      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCommentUser = (userId: string) => {
    // In a real app, you'd fetch user details from a users table
    // For now, we'll just return the first part of the email or the ID
    return userId.split('@')[0] || userId
  }

  return (
    <div className="space-y-6">
      {/* Comment List */}
      <div className="space-y-4">
        {selectedTicketComments.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          selectedTicketComments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border bg-card p-4"
            >
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getCommentUser(comment.user_id).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {getCommentUser(comment.user_id)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {comment.is_internal && (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        Internal Note
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Form */}
      <div className="rounded-lg border bg-card p-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[100px] resize-none"
        />
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting || !user}
            className="bg-pine-green hover:bg-pine-green/90"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 