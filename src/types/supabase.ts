import { TicketStatus, TicketPriority } from './tickets'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tickets: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          status: TicketStatus
          priority: TicketPriority
          user_id: string
          agent_id: string | null
          internal_notes: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          status: TicketStatus
          priority: TicketPriority
          user_id: string
          agent_id?: string | null
          internal_notes?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          status?: TicketStatus
          priority?: TicketPriority
          user_id?: string
          agent_id?: string | null
          internal_notes?: string[] | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string
          role: 'admin' | 'agent' | 'customer'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          name: string
          role: 'admin' | 'agent' | 'customer'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string
          role?: 'admin' | 'agent' | 'customer'
        }
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          content: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          content: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          content?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ticket_attachments: {
        Row: {
          id: string
          ticket_id: string
          comment_id: string | null
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          comment_id?: string | null
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          comment_id?: string | null
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          uploaded_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 