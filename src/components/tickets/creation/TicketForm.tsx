/**
 * TicketForm.tsx
 * Customer-facing ticket creation form with file upload support.
 * Uses React Hook Form + Zod for validation and Shadcn components for UI.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useTicketStore } from '@/stores/ticketStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TicketPriority } from '@/lib/types/supabase';
import { FileUpload } from './FileUpload';
import { cn } from '@/lib/utils';
import { PRIORITY_OPTIONS, PRIORITY_COLORS } from '@/lib/types/ticket'

// Form validation schema
const ticketFormSchema = z.object({
  subject: z.string()
    .min(1, 'Subject is required')
    .max(255, 'Subject must be less than 255 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  priority: z.custom<TicketPriority>(),
  attachments: z.array(z.instanceof(File)).optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  onSuccess?: (ticketId: string) => void;
}

export function TicketForm({ onSuccess }: TicketFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { createTicket, uploadAttachment, loading, error } = useTicketStore();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'normal',
      attachments: [],
    },
  });

  const onSubmit = async (data: TicketFormValues) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) {
        throw new Error('User not authenticated');
      }

      // Create ticket
      const ticket = await createTicket({
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        created_by: user.data.user.id,
        customer_id: user.data.user.id,
        tags: [],
        metadata: {},
      });

      if (!ticket) {
        return; // Error will be handled by the store's error state
      }

      // Upload attachments if any
      if (files.length > 0) {
        await Promise.all(
          files.map((file) => uploadAttachment(ticket.id, file))
        );
      }

      // Reset form
      form.reset();
      setFiles([]);

      // Call success callback if provided
      onSuccess?.(ticket.id);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 bg-cabin-cream rounded-lg shadow-lg">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-lodge-brown">Create New Ticket</h2>
        <p className="text-gray-600">
          Please provide details about your issue or request.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Brief summary of your issue"
                    {...field}
                    className="bg-white"
                  />
                </FormControl>
                <FormDescription>
                  A clear and concise title for your ticket
                </FormDescription>
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
                    placeholder="Please provide detailed information about your issue..."
                    className="min-h-[150px] bg-white"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include any relevant details that could help us assist you
                </FormDescription>
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
                <Select
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority">
                      {field.value && (
                        <span className={cn("capitalize", PRIORITY_COLORS[field.value].split(' ')[1])}>
                          {PRIORITY_OPTIONS.find(opt => opt.value === field.value)?.label}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(({ value, label }) => (
                      <SelectItem 
                        key={value} 
                        value={value}
                      >
                        <span className={cn("capitalize", PRIORITY_COLORS[value].split(' ')[1])}>
                          {label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the urgency level of your issue
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FileUpload
            files={files}
            setFiles={setFiles}
            maxFiles={5}
            maxSize={5 * 1024 * 1024} // 5MB
          />

          {error && (
            <div className="text-ember-orange text-sm" role="alert">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-lodge-brown hover:bg-lodge-brown/90 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2" />
                Creating Ticket...
              </>
            ) : (
              'Create Ticket'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 