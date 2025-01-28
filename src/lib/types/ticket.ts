import { z } from "zod";
import type { Database } from "./supabase";
import type { TicketStatus, TicketPriority, Json } from "./supabase";
import type { UserProfile } from "@/stores/authStore";

// Database Table Types
export type Tables = Database['public']['Tables']
export type TicketRow = Tables['tickets']['Row']
export type TicketInsert = Tables['tickets']['Insert']
export type TicketUpdate = Tables['tickets']['Update']
export type TicketCommentRow = Tables['ticket_comments']['Row']
export type TicketAttachmentRow = Tables['ticket_attachments']['Row']
export type TicketCommentInsert = Tables['ticket_comments']['Insert']
export type TicketAttachmentInsert = Tables['ticket_attachments']['Insert']

// Zod Schemas for Runtime Validation
const jsonSchema: z.ZodType<Json> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.lazy(() => z.record(jsonSchema)),
  z.lazy(() => z.array(jsonSchema)),
]);

export const TicketSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(1).max(255),
  description: z.string(),
  status: z.enum(['open', 'in_progress', 'pending', 'on_hold', 'solved', 'closed'] as const),
  priority: z.enum(['urgent', 'high', 'normal', 'low'] as const),
  created_by: z.string().uuid(),
  customer_id: z.string().uuid().nullable(),
  assigned_to: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable(),
  tags: z.array(z.string()).nullable(),
  metadata: jsonSchema.nullable(),
}) satisfies z.ZodType<TicketRow>;

export const CreateTicketSchema = z.object({
  subject: z.string().min(1).max(255),
  description: z.string(),
  priority: z.enum(['urgent', 'high', 'normal', 'low'] as const).optional(),
  created_by: z.string().uuid(),
  customer_id: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  metadata: jsonSchema.nullable().optional(),
}) satisfies z.ZodType<TicketInsert>;

export const UpdateTicketSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'pending', 'on_hold', 'solved', 'closed'] as const).optional(),
  priority: z.enum(['urgent', 'high', 'normal', 'low'] as const).optional(),
  customer_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  closed_at: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  metadata: jsonSchema.nullable().optional(),
}) satisfies z.ZodType<TicketUpdate>;

export const TicketCommentSchema = z.object({
  id: z.string().uuid(),
  ticket_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string(),
  is_internal: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
}) satisfies z.ZodType<TicketCommentRow>;

export const CreateTicketCommentSchema = z.object({
  ticket_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string(),
  is_internal: z.boolean().optional(),
}) satisfies z.ZodType<TicketCommentInsert>;

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
}) satisfies z.ZodType<TicketAttachmentRow>;

export const CreateTicketAttachmentSchema = z.object({
  ticket_id: z.string().uuid(),
  comment_id: z.string().uuid().nullable(),
  file_name: z.string(),
  file_type: z.string(),
  file_size: z.number(),
  storage_path: z.string(),
  uploaded_by: z.string().uuid(),
}) satisfies z.ZodType<TicketAttachmentInsert>;

// Ticket Filter Types
export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: string | null;
  customer_id?: string;
  search?: string;
}

export interface TicketQueryOptions {
  role?: 'agent' | 'customer' | 'admin';
  view?: 'dashboard' | 'queue' | 'list';
  filters?: TicketFilters;
  limit?: number;
  order?: {
    field: keyof Pick<TicketRow, 'created_at' | 'updated_at' | 'priority'>;
    ascending?: boolean;
  }[];
}

// Store State Types
export interface TicketState {
  tickets: TicketRow[];
  selectedTicket: TicketRow | null;
  selectedTicketComments: TicketCommentRow[];
  selectedTicketAttachments: TicketAttachmentRow[];
  userProfiles: Record<string, UserProfile>;
  loading: boolean;
  error: string | null;
  filters: TicketFilters;
  agentStats: {
    assigned_tickets: number;
    resolved_today: number;
    average_response_time: number;
    satisfaction_rate: number;
  } | null;
  dashboardTickets: Pick<TicketRow, 'id' | 'subject' | 'status' | 'priority' | 'created_at' | 'updated_at'>[];
  
  // Ticket CRUD
  fetchTickets: (filters?: TicketFilters) => Promise<void>;
  createTicket: (ticket: TicketInsert) => Promise<TicketRow | null>;
  updateTicket: (id: string, updates: TicketUpdate) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  
  // Comment operations
  fetchComments: (ticketId: string) => Promise<void>;
  addComment: (comment: Omit<TicketCommentInsert, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  
  // Attachment operations
  uploadAttachment: (ticketId: string, file: File, commentId?: string | null) => Promise<void>;
  deleteAttachment: (id: string) => Promise<void>;
  
  // UI state
  selectTicket: (ticketIdOrTicket: string | TicketRow | null) => void;
  setFilters: (filters: TicketFilters) => void;
  
  // Agent operations
  fetchAgentQueue: () => Promise<void>;
  assignTicket: (ticketId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  
  // Dashboard operations
  fetchAgentDashboardData: () => Promise<void>;

  // Profile operations
  fetchProfiles: (userIds: string[]) => Promise<void>;
}

// UI Options derived from Database Enums
export const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'solved', label: 'Solved' },
  { value: 'closed', label: 'Closed' },
] as const;

export const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
] as const;

// Color mappings for UI
export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  urgent: 'bg-ember-orange/20 text-ember-orange',
  high: 'bg-lodge-brown/20 text-lodge-brown',
  normal: 'bg-pine-green/20 text-pine-green',
  low: 'bg-twilight-gray/20 text-twilight-gray',
} as const;

export const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'bg-pine-green/20 text-pine-green',
  in_progress: 'bg-lodge-brown/20 text-lodge-brown',
  pending: 'bg-ember-orange/20 text-ember-orange',
  on_hold: 'bg-lodge-brown/20 text-lodge-brown',
  solved: 'bg-pine-green/20 text-pine-green',
  closed: 'bg-twilight-gray/20 text-twilight-gray',
} as const; 