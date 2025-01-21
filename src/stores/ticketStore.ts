import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/types/supabase';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketComment = Database['public']['Tables']['ticket_comments']['Row'];

interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  createTicket: (ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  addComment: (comment: Omit<TicketComment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  selectTicket: (ticket: Ticket | null) => void;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,

  fetchTickets: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ tickets: data });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createTicket: async (ticket) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('tickets')
        .insert([ticket])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ tickets: [data, ...state.tickets] }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateTicket: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? data : t)),
        selectedTicket: state.selectedTicket?.id === id ? data : state.selectedTicket,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addComment: async (comment) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('ticket_comments')
        .insert([comment]);

      if (error) throw error;
      // Optionally fetch updated ticket data if needed
      const ticketId = comment.ticket_id;
      if (get().selectedTicket?.id === ticketId) {
        const { data: updatedTicket, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .single();

        if (ticketError) throw ticketError;
        set((state) => ({
          selectedTicket: updatedTicket,
          tickets: state.tickets.map((t) => (t.id === ticketId ? updatedTicket : t)),
        }));
      }
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  selectTicket: (ticket) => {
    set({ selectedTicket: ticket });
  },
})); 