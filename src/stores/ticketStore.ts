import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/types/supabase';
import type { TicketStatus, TicketPriority } from '@/lib/types/supabase';
import { Ticket, CreateTicket as TicketInsert, UpdateTicket as TicketUpdate, User } from '@/lib/types/ticket';
import { useAuthStore } from './authStore';

type TicketComment = Database['public']['Tables']['ticket_comments']['Row'];
type TicketAttachment = Database['public']['Tables']['ticket_attachments']['Row'];

interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string | null;
  search?: string;
}

interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  selectedTicketComments: TicketComment[];
  selectedTicketAttachments: TicketAttachment[];
  loading: boolean;
  error: string | null;
  filters: TicketFilters;
  
  // Ticket CRUD
  fetchTickets: (filters?: TicketFilters) => Promise<void>;
  createTicket: (ticket: TicketInsert) => Promise<Ticket | null>;
  updateTicket: (id: string, updates: TicketUpdate) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  
  // Comment operations
  fetchComments: (ticketId: string) => Promise<void>;
  addComment: (comment: Omit<Database['public']['Tables']['ticket_comments']['Insert'], 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  
  // Attachment operations
  uploadAttachment: (
    ticketId: string,
    file: File,
    commentId?: string | null
  ) => Promise<void>;
  deleteAttachment: (id: string) => Promise<void>;
  
  // UI state
  selectTicket: (ticketIdOrTicket: string | Ticket | null) => void;
  setFilters: (filters: TicketFilters) => void;
  
  // Agent operations
  fetchAgentQueue: () => Promise<void>;
  assignTicket: (ticketId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  selectedTicket: null,
  selectedTicketComments: [],
  selectedTicketAttachments: [],
  loading: false,
  error: null,
  filters: {},

  fetchTickets: async (filters = get().filters) => {
    try {
      console.log('[TicketStore] Fetching tickets with filters:', filters);
      set({ loading: true, error: null });
      let query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.assignedTo !== undefined) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      console.log('[TicketStore] Tickets fetch response:', { count: data?.length, error });

      if (error) throw error;
      set({ tickets: data || [], filters });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createTicket: async (ticket: TicketInsert) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticket)
        .select()
        .single();

      if (error) throw error;
      const newTicket = data as Ticket;
      set((state) => ({
        tickets: [newTicket, ...state.tickets],
        loading: false
      }));
      return newTicket;
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      console.error('[TicketStore] Error creating ticket:', error);
      return null;
    }
  },

  updateTicket: async (id: string, updates: TicketUpdate) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticket.id === id ? { ...ticket, ...updates } : ticket
        ),
        selectedTicket: state.selectedTicket?.id === id ? { ...state.selectedTicket, ...updates } : state.selectedTicket,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTicket: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id),
        selectedTicket: state.selectedTicket?.id === id ? null : state.selectedTicket,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchComments: async (ticketId: string) => {
    try {
      set({ loading: true, error: null });
      const { data: comments, error: commentsError } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      const { data: attachments, error: attachmentsError } = await supabase
        .from('ticket_attachments')
        .select('*')
        .eq('ticket_id', ticketId);

      if (attachmentsError) throw attachmentsError;

      set({ 
        selectedTicketComments: comments || [],
        selectedTicketAttachments: attachments || [],
      });
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
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert([comment])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        selectedTicketComments: [...state.selectedTicketComments, data],
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateComment: async (id: string, content: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('ticket_comments')
        .update({ content })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        selectedTicketComments: state.selectedTicketComments.map((c) =>
          c.id === id ? data : c
        ),
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteComment: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('ticket_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        selectedTicketComments: state.selectedTicketComments.filter((c) => c.id !== id),
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  uploadAttachment: async (ticketId: string, file: File, commentId = null) => {
    try {
      set({ loading: true, error: null });
      
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${ticketId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ticket-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create attachment record
      const attachment: Database['public']['Tables']['ticket_attachments']['Insert'] = {
        ticket_id: ticketId,
        comment_id: commentId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id!,
      };

      const { data, error } = await supabase
        .from('ticket_attachments')
        .insert([attachment])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        selectedTicketAttachments: [...state.selectedTicketAttachments, data],
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteAttachment: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      // 1. Get attachment info
      const { data: attachment, error: fetchError } = await supabase
        .from('ticket-attachments')
        .select()
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Delete from storage
      const { error: storageError } = await supabase.storage
        .from('ticket-attachments')
        .remove([attachment.storage_path]);

      if (storageError) throw storageError;

      // 3. Delete record
      const { error } = await supabase
        .from('ticket-attachments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        selectedTicketAttachments: state.selectedTicketAttachments.filter((a) => a.id !== id),
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  selectTicket: async (ticketIdOrTicket: string | Ticket | null) => {
    if (!ticketIdOrTicket) {
      set({ selectedTicket: null, selectedTicketComments: [], selectedTicketAttachments: [] })
      return
    }

    const ticketId = typeof ticketIdOrTicket === 'string' ? ticketIdOrTicket : ticketIdOrTicket.id
    
    try {
      set({ loading: true, error: null })
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
          *,
          customer:customer_id(*),
          assigned_to:assigned_to_id(*)
        `)
        .eq('id', ticketId)
        .single()

      if (error) throw error

      set({ selectedTicket: ticket as Ticket })
      await get().fetchComments(ticketId)
    } catch (err) {
      const error = err as Error
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  setFilters: (filters: TicketFilters) => {
    set({ filters });
    get().fetchTickets(filters);
  },

  fetchAgentQueue: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    await get().fetchTickets({
      ...get().filters,
      assignedTo: currentUser.id,
      status: 'open',
    });
  },

  assignTicket: async (ticketId: string) => {
    const currentUser = useAuthStore.getState().user as User;
    if (!currentUser) return;

    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          assigned_to_id: currentUser.id,
          status: 'in_progress' as const
        })
        .eq('id', ticketId);

      if (error) throw error;
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                assigned_to_id: currentUser.id,
                assigned_to: currentUser,
                status: 'in_progress' as const
              }
            : ticket
        ),
        loading: false
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
    }
  },

  updateTicketStatus: async (ticketId: string, status: TicketStatus) => {
    await get().updateTicket(ticketId, {
      status,
      closed_at: status === 'closed' ? new Date().toISOString() : null,
    });
  },
})); 