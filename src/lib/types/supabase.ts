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

export type UserRole = 'customer' | 'agent' | 'admin';
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'solved' | 'closed';
export type TicketPriority = 'normal' | 'low' | 'medium' | 'high' | 'urgent';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          subject: string;
          description: string;
          status: TicketStatus;
          priority: TicketPriority;
          created_by: string;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
          closed_at: string | null;
          tags: string[];
          metadata: Json;
        };
        Insert: {
          id?: string;
          subject: string;
          description: string;
          status?: TicketStatus;
          priority?: TicketPriority;
          created_by: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
          tags?: string[];
          metadata?: Json;
        };
        Update: {
          id?: string;
          subject?: string;
          description?: string;
          status?: TicketStatus;
          priority?: TicketPriority;
          created_by?: string;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
          closed_at?: string | null;
          tags?: string[];
          metadata?: Json;
        };
      };
      ticket_comments: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string;
          content: string;
          is_internal: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id: string;
          content: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          user_id?: string;
          content?: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_attachments: {
        Row: {
          id: string;
          ticket_id: string;
          comment_id: string | null;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          comment_id?: string | null;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          comment_id?: string | null;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          uploaded_by?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      get_agent_performance_stats: {
        Args: Record<string, never>;
        Returns: {
          assigned_tickets: number;
          resolved_today: number;
          average_response_time: number;
          satisfaction_rate: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
    };
  }
} 