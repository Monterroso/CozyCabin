export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      ticket_attachments: {
        Row: {
          comment_id: string | null
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          storage_path: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          storage_path: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          storage_path?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "ticket_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"] | null
          closed_at: string | null
          created_at: string
          created_by: string
          customer_id: string | null
          description: string
          id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"] | null
          closed_at?: string | null
          created_at?: string
          created_by: string
          customer_id?: string | null
          description: string
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"] | null
          closed_at?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_invite: {
        Args: {
          invite_email: string
          invite_role: string
        }
        Returns: string
      }
      get_agent_performance_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          assigned_tickets: number
          resolved_today: number
          average_response_time: number
          satisfaction_rate: number
        }[]
      }
      verify_invite: {
        Args: {
          token: string
        }
        Returns: {
          is_valid: boolean
          invite_email: string
          invite_role: Database["public"]["Enums"]["user_role"]
        }[]
      }
    }
    Enums: {
      ticket_category:
        | "billing"
        | "technical"
        | "account"
        | "feature_request"
        | "bug"
        | "security"
        | "other"
      ticket_priority: "urgent" | "high" | "normal" | "low"
      ticket_status:
        | "open"
        | "in_progress"
        | "pending"
        | "on_hold"
        | "solved"
        | "closed"
      user_role: "customer" | "agent" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Export the enum types directly for convenience
export type TicketStatus = Database['public']['Enums']['ticket_status']
export type TicketPriority = Database['public']['Enums']['ticket_priority']
export type UserRole = Database['public']['Enums']['user_role'] 
