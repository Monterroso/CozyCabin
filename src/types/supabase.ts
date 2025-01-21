export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          role: 'customer' | 'agent' | 'admin'
          is_active: boolean
          email: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'agent' | 'admin'
          is_active?: boolean
          email: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'agent' | 'admin'
          is_active?: boolean
          email?: string
        }
      }
      tickets: {
        Row: {
          id: string
          subject: string
          description: string
          status: 'open' | 'in_progress' | 'pending' | 'on_hold' | 'solved' | 'closed'
          priority: 'urgent' | 'high' | 'normal' | 'low'
          created_by: string
          assigned_to: string | null
          created_at: string
          updated_at: string
          closed_at: string | null
          tags: string[]
          metadata: Record<string, any>
        }
        Insert: {
          id?: string
          subject: string
          description: string
          status?: 'open' | 'in_progress' | 'pending' | 'on_hold' | 'solved' | 'closed'
          priority?: 'urgent' | 'high' | 'normal' | 'low'
          created_by: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          closed_at?: string | null
          tags?: string[]
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          subject?: string
          description?: string
          status?: 'open' | 'in_progress' | 'pending' | 'on_hold' | 'solved' | 'closed'
          priority?: 'urgent' | 'high' | 'normal' | 'low'
          created_by?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          closed_at?: string | null
          tags?: string[]
          metadata?: Record<string, any>
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
      user_role: 'customer' | 'agent' | 'admin'
      ticket_status: 'open' | 'in_progress' | 'pending' | 'on_hold' | 'solved' | 'closed'
      ticket_priority: 'urgent' | 'high' | 'normal' | 'low'
    }
  }
} 