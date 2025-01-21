/**
 * Supabase Database Types
 * 
 * Generated types for Supabase tables and enums.
 * To be expanded as we add more tables and types.
 */

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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          role: Database['public']['Enums']['user_role']
          is_active: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean
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
      user_role: 'customer' | 'agent' | 'admin'
      ticket_status: 'open' | 'in_progress' | 'pending' | 'on_hold' | 'solved' | 'closed'
      ticket_priority: 'urgent' | 'high' | 'normal' | 'low'
    }
  }
} 