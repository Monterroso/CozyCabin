import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTicketStore } from '@/stores/ticketStore'
import { useAuth } from '@/hooks/useAuth'
import { type Ticket, STATUS_COLORS, PRIORITY_COLORS } from '@/lib/types/ticket'
import { type TicketStatus, type TicketPriority } from '@/lib/types/supabase'
import { cn } from '@/lib/utils'

const internalNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
})

const ticketUpdateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'pending', 'closed', 'solved'] as const),
  priority: z.enum(['urgent', 'high', 'normal', 'low', 'medium'] as const),
  internal_note: z.string().optional(),
})

type InternalNoteForm = z.infer<typeof internalNoteSchema>
type TicketUpdateForm = z.infer<typeof ticketUpdateSchema>

interface Props {
  ticket: Ticket
}

export function AgentTicketManagement({ ticket }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details')
  const { updateTicket, addComment } = useTicketStore()
  const { user } = useAuth()

  const updateForm = useForm<TicketUpdateForm>({
    resolver: zodResolver(ticketUpdateSchema),
    defaultValues: {
      status: ticket.status as TicketStatus,
      priority: ticket.priority as TicketPriority,
      internal_note: '',
    },
  })

  const noteForm = useForm<InternalNoteForm>({
    resolver: zodResolver(internalNoteSchema),
    defaultValues: {
      content: '',
    },
  })

  const onUpdateSubmit = async (data: TicketUpdateForm) => {
    if (!user?.id) return

    await updateTicket(ticket.id, {
      status: data.status,
      priority: data.priority,
    })

    if (data.internal_note) {
      await addComment({
        ticket_id: ticket.id,
        user_id: user.id,
        content: data.internal_note,
        is_internal: true,
      })
    }
  }

  const onNoteSubmit = async (data: InternalNoteForm) => {
    if (!user?.id) return

    await addComment({
      ticket_id: ticket.id,
      user_id: user.id,
      content: data.content,
      is_internal: true,
    })
    noteForm.reset()
  }

  return (
    <Card className="bg-cabin-cream border-twilight-gray/20">
      <CardHeader>
        <CardTitle className="text-lodge-brown">Ticket Management</CardTitle>
        <CardDescription className="text-twilight-gray">
          Update ticket status, priority, and add internal notes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex border-b border-twilight-gray/20">
            <button
              className={cn(
                "px-4 py-2 -mb-px text-sm font-medium transition-colors",
                activeTab === 'details'
                  ? "border-b-2 border-pine-green text-pine-green"
                  : "text-twilight-gray hover:text-pine-green"
              )}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={cn(
                "px-4 py-2 -mb-px text-sm font-medium transition-colors",
                activeTab === 'notes'
                  ? "border-b-2 border-pine-green text-pine-green"
                  : "text-twilight-gray hover:text-pine-green"
              )}
              onClick={() => setActiveTab('notes')}
            >
              Internal Notes
            </button>
          </div>

          {activeTab === 'details' && (
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={updateForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lodge-brown">Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white border-twilight-gray/20">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="open">
                              <Badge className={cn("capitalize", STATUS_COLORS.open)}>
                                Open
                              </Badge>
                            </SelectItem>
                            <SelectItem value="in_progress">
                              <Badge className={cn("capitalize", STATUS_COLORS.in_progress)}>
                                In Progress
                              </Badge>
                            </SelectItem>
                            <SelectItem value="pending">
                              <Badge className={cn("capitalize", STATUS_COLORS.pending)}>
                                Pending
                              </Badge>
                            </SelectItem>
                            <SelectItem value="closed">
                              <Badge className={cn("capitalize", STATUS_COLORS.closed)}>
                                Closed
                              </Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lodge-brown">Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white border-twilight-gray/20">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="urgent">
                              <Badge className={cn("capitalize", PRIORITY_COLORS.urgent)}>
                                Urgent
                              </Badge>
                            </SelectItem>
                            <SelectItem value="high">
                              <Badge className={cn("capitalize", PRIORITY_COLORS.high)}>
                                High
                              </Badge>
                            </SelectItem>
                            <SelectItem value="normal">
                              <Badge className={cn("capitalize", PRIORITY_COLORS.normal)}>
                                Normal
                              </Badge>
                            </SelectItem>
                            <SelectItem value="low">
                              <Badge className={cn("capitalize", PRIORITY_COLORS.low)}>
                                Low
                              </Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={updateForm.control}
                  name="internal_note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lodge-brown">Internal Note (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add a note about this update..."
                          className="bg-white border-twilight-gray/20 min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit"
                  className="bg-lodge-brown text-cabin-cream hover:bg-lodge-brown/90"
                >
                  Update Ticket
                </Button>
              </form>
            </Form>
          )}

          {activeTab === 'notes' && (
            <Form {...noteForm}>
              <form onSubmit={noteForm.handleSubmit(onNoteSubmit)} className="space-y-4">
                <FormField
                  control={noteForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lodge-brown">Internal Note</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add an internal note..."
                          className="bg-white border-twilight-gray/20 min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit"
                  className="bg-pine-green text-cabin-cream hover:bg-pine-green/90"
                >
                  Add Note
                </Button>
              </form>
            </Form>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 