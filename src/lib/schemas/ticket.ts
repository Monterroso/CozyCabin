/**
 * ticket.ts
 * Zod schemas for ticket-related forms and validation
 * 
 * This module defines the validation schemas and types for the ticket system.
 * It uses Zod for runtime type checking and validation of ticket data.
 * The schemas enforce business rules like character limits and required fields.
 */

import { z } from 'zod'

/**
 * Valid ticket priority levels
 * - urgent: Immediate attention required, critical issues
 * - high: Important issues needing quick resolution
 * - normal: Standard issues with regular handling
 * - low: Non-critical issues that can be handled when resources are available
 */
export const ticketPriorities = ['urgent', 'high', 'normal', 'low'] as const

/**
 * Valid ticket status values
 * - open: New ticket awaiting initial response
 * - in_progress: Currently being worked on
 * - pending: Awaiting customer response
 * - on_hold: Temporarily paused
 * - solved: Resolution provided
 * - closed: Ticket completed and archived
 */
export const ticketStatuses = ['open', 'in_progress', 'pending', 'on_hold', 'solved', 'closed'] as const

/**
 * Schema for creating new support tickets
 * 
 * @property subject - Brief description of the issue (5-100 characters)
 * @property description - Detailed explanation of the issue (20-2000 characters)
 * @property priority - Ticket urgency level (defaults to 'normal')
 * @property tags - Optional categorization tags (1-5 tags)
 * @property metadata - Additional custom fields as key-value pairs
 */
export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  priority: z.enum(ticketPriorities).default('normal'),
  tags: z
    .array(z.string())
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed')
    .optional()
    .default([]),
  metadata: z.record(z.unknown()).optional().default({}),
})

/**
 * Schema for updating existing tickets
 * Extends createTicketSchema to make all fields optional and adds:
 * 
 * @property status - Current ticket status
 * @property assigned_to - UUID of the assigned agent
 */
export const updateTicketSchema = createTicketSchema
  .partial()
  .extend({
    status: z.enum(ticketStatuses).optional(),
    assigned_to: z.string().uuid().optional().nullable(),
  })

/**
 * Schema for ticket comments
 * 
 * @property content - The comment text (1-1000 characters)
 * @property is_internal - Whether the comment is visible to customers
 */
export const ticketCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters'),
  is_internal: z.boolean().default(false),
})

// Type exports for use in components and API calls
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type TicketCommentInput = z.infer<typeof ticketCommentSchema> 