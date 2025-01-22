/**
 * CreateTicketForm.tsx
 * Form component for creating new support tickets with validation
 * 
 * This component provides a form interface for users to create support tickets.
 * It uses React Hook Form with Zod validation to ensure data quality and
 * provides real-time feedback on validation errors. The form includes fields
 * for subject, description, and priority level.
 * 
 * Features:
 * - Real-time form validation
 * - Accessible form controls with ARIA labels
 * - Loading states during submission
 * - Error handling with toast notifications
 * - Keyboard navigation support
 * 
 * @example
 * ```tsx
 * <CreateTicketForm />
 * ```
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTicketStore } from '@/stores/ticketStore'
import { TicketPriority } from '@/types/tickets'

const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  priority: z.enum(['low', 'medium', 'high'] as const),
})

type CreateTicketForm = z.infer<typeof createTicketSchema>

/**
 * CreateTicketForm Component
 * 
 * A form component that handles the creation of new support tickets.
 * Uses React Hook Form for form state management and Zod for validation.
 * Integrates with Supabase for data persistence and provides toast
 * notifications for user feedback.
 * 
 * @returns {JSX.Element} A form component for creating tickets
 */
export function CreateTicketForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { createTicket } = useTicketStore()

  const form = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'low',
    },
  })

  const onSubmit = async (data: CreateTicketForm) => {
    try {
      setIsSubmitting(true)
      await createTicket(data)
      toast({
        title: 'Success',
        description: 'Your ticket has been created successfully.',
      })
      navigate('/tickets')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create ticket. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief summary of your issue" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of your issue"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tickets')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 