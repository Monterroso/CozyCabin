import { Database } from './supabase'

export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'closed'
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low'
export type UserRole = 'admin' | 'agent' | 'customer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  updated_at: string
  customer_id: string
  assigned_to_id: string | null
  customer: User
  assigned_to: User | null
}

export type TicketRow = Database['public']['Tables']['tickets']['Row']
export type TicketInsert = Database['public']['Tables']['tickets']['Insert']
export type TicketUpdate = Database['public']['Tables']['tickets']['Update']

// Type guards for ticket status and priority
export const isTicketStatus = (status: string): status is TicketStatus => {
  return ['open', 'in_progress', 'pending', 'closed'].includes(status)
}

export const isTicketPriority = (priority: string): priority is TicketPriority => {
  return ['urgent', 'high', 'normal', 'low'].includes(priority)
}

// Color mappings
export const PRIORITY_COLORS = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  normal: 'bg-blue-500',
  low: 'bg-green-500',
} as const

export const STATUS_COLORS = {
  open: 'bg-pine-green',
  in_progress: 'bg-lodge-brown',
  pending: 'bg-ember-orange',
  closed: 'bg-twilight-gray',
} as const 