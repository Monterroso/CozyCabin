import { z } from "zod";
import type { TicketStatus, TicketPriority } from "./supabase";

// Ticket Status and Priority Enums (using types from supabase)
export const TicketStatusEnum = z.enum(["open", "in_progress", "pending", "solved", "closed"]) satisfies z.ZodType<TicketStatus>;
export const TicketPriorityEnum = z.enum(["normal", "low", "medium", "high", "urgent"]) satisfies z.ZodType<TicketPriority>;

// Color mappings for UI
export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  normal: 'bg-blue-500',
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
} as const;

export const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'bg-pine-green',
  in_progress: 'bg-lodge-brown',
  pending: 'bg-ember-orange',
  solved: 'bg-blue-500',
  closed: 'bg-twilight-gray',
} as const;

// Base Ticket Schema
export const TicketSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(1).max(255),
  description: z.string(),
  status: TicketStatusEnum.default("open"),
  priority: TicketPriorityEnum.default("normal"),
  created_by: z.string().uuid(),
  customer_id: z.string().uuid(),
  assigned_to: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export type Ticket = z.infer<typeof TicketSchema>;

// Ticket Creation Schema (without auto-generated fields)
export const CreateTicketSchema = TicketSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  closed_at: true,
  assigned_to: true,
  status: true,
}).extend({
  created_by: z.string().uuid().optional(),
  attachments: z.array(z.object({
    file_name: z.string(),
    file_type: z.string(),
    file_size: z.number(),
    storage_path: z.string(),
  })).optional(),
});

export type CreateTicket = z.infer<typeof CreateTicketSchema>;

// Ticket Update Schema
export const UpdateTicketSchema = CreateTicketSchema.partial().extend({
  status: TicketStatusEnum.optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  closed_at: z.string().datetime().nullable().optional(),
});

export type UpdateTicket = z.infer<typeof UpdateTicketSchema>;

// Ticket Comment Schema
export const TicketCommentSchema = z.object({
  id: z.string().uuid(),
  ticket_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string(),
  is_internal: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TicketComment = z.infer<typeof TicketCommentSchema>;

// Ticket Attachment Schema
export const TicketAttachmentSchema = z.object({
  id: z.string().uuid(),
  ticket_id: z.string().uuid(),
  comment_id: z.string().uuid().nullable(),
  file_name: z.string(),
  file_type: z.string(),
  file_size: z.number(),
  storage_path: z.string(),
  uploaded_by: z.string().uuid(),
  created_at: z.string().datetime(),
});

export type TicketAttachment = z.infer<typeof TicketAttachmentSchema>; 