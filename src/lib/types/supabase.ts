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
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'on_hold' | 'solved' | 'closed';
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';

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
          title: string;
          description: string;
          status: TicketStatus;
          priority: TicketPriority;
          customer_id: string;
          assigned_agent_id: string | null;
          created_at: string;
          updated_at: string;
          tags: string[];
          custom_fields: Json;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: TicketStatus;
          priority?: TicketPriority;
          customer_id: string;
          assigned_agent_id?: string | null;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          custom_fields?: Json;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: TicketStatus;
          priority?: TicketPriority;
          customer_id?: string;
          assigned_agent_id?: string | null;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          custom_fields?: Json;
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
          attachments: string[];
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id: string;
          content: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
          attachments?: string[];
        };
        Update: {
          id?: string;
          ticket_id?: string;
          user_id?: string;
          content?: string;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string;
          attachments?: string[];
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      user_role: UserRole;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
    };
  }
} 