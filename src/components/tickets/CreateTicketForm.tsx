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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { createTicketSchema, type CreateTicketInput } from '@/lib/schemas/ticket'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ticketPriorities } from '@/lib/schemas/ticket'
import { useSupabase } from '@/hooks/useSupabase'

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
  // State for managing form submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Initialize form with Zod validation
  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'normal',
      tags: [],
    },
  })

  /**
   * Handles form submission
   * Creates a new ticket in Supabase and shows success/error notifications
   * 
   * @param {CreateTicketInput} data - The validated form data
   */
  const onSubmit = async (data: CreateTicketInput) => {
    try {
      setIsSubmitting(true)

      const { error } = await supabase
        .from('tickets')
        .insert([data])
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Ticket Created',
        description: 'Your support ticket has been submitted successfully.',
      })

      navigate('/tickets')
    } catch (error) {
      console.error('Error creating ticket:', error)
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
    <Card>
      <CardHeader>
        <CardTitle>Create Support Ticket</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-6"
            aria-label="Create support ticket form"
          >
            {/* Subject Field */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormDescription>
                    Briefly describe your issue in a few words
                  </FormDescription>
                  <FormControl>
                    <Input 
                      placeholder="Brief description of the issue" 
                      {...field}
                      aria-describedby="subject-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormDescription>
                    Provide detailed information about your issue
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed explanation of your issue..."
                      className="min-h-[120px]"
                      {...field}
                      aria-describedby="description-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority Selection */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <FormDescription>
                    Select the urgency level of your issue
                  </FormDescription>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    aria-describedby="priority-description"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ticketPriorities.map((priority) => (
                        <SelectItem 
                          key={priority} 
                          value={priority} 
                          className="capitalize"
                        >
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div 
              className="flex justify-end gap-4"
              role="group"
              aria-label="Form submission"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tickets')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 