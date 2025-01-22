export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'solved' | 'closed'
export type TicketPriority = 'normal' | 'low' | 'medium' | 'high' | 'urgent'

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  created_at: string
  updated_at: string
  user_id: string
  agent_id?: string | null
  internal_notes?: string[] | null
}

export interface CreateTicketInput {
  title: string
  description: string
  priority: TicketPriority
}

export interface UpdateTicketInput {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  agent_id?: string | null
  internal_notes?: string[] | null
} 