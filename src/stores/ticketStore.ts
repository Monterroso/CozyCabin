import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Json, TicketStatus } from '@/lib/types/supabase';
import type { User } from '@supabase/supabase-js';
import { useAuthStore } from './authStore';
import type { UserProfile } from './authStore';
import type {
  TicketState,
  TicketRow,
  TicketQueryOptions,
  TicketFilters,
  TicketInsert,
  TicketUpdate,
  TicketCommentRow,
  TicketAttachmentRow,
  TicketCommentInsert,
  TicketAttachmentInsert
} from '@/lib/types/ticket';

/**
 * A single, unified function to fetch tickets with varying parameters
 */
const fetchTicketsUnified = async (options: TicketQueryOptions): Promise<TicketRow[]> => {
  const { role, view, filters, limit = 10, order } = options;
  
  // Start with base query
  let query = supabase
    .from('tickets')
    .select('*');

  // Apply role-based filtering
  if (role === 'agent') {
    // For agents, we either show their assigned tickets or unassigned tickets
    if (filters?.assigned_to === undefined) {
      // No assigned_to filter specified, show agent's tickets by default
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        query = query.eq('assigned_to', currentUser.id);
      }
    }
    // If filters.assigned_to is null or a specific ID, that filter will be applied later
  } else if (role === 'customer') {
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      query = query.eq('customer_id', currentUser.id);
    }
  }
  // Admin role doesn't need special filtering

  // Apply view-specific logic
  if (view === 'dashboard') {
    query = query.order('priority', { ascending: false });
  } else if (view === 'queue') {
    query = query.eq('status', 'open');
  }

  // Apply filters
  if (filters) {
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.assigned_to !== undefined) {
      if (filters.assigned_to === null) {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', filters.assigned_to);
      }
    }
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters.search) {
      query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
  }

  // Apply ordering
  if (order && order.length > 0) {
    order.forEach(({ field, ascending = true }) => {
      query = query.order(field, { ascending });
    });
  } else {
    // Default ordering
    query = query.order('created_at', { ascending: false });
  }

  // Apply limit
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

/**
 * A unified function to handle comment operations
 */
const handleCommentOperation = async (
  operation: 'create' | 'update' | 'delete',
  comment: TicketCommentInsert | { id: string },
) => {
  try {
    switch (operation) {
      case 'create': {
        const { data, error } = await supabase
          .from('ticket_comments')
          .insert([comment])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      case 'update': {
        const { id, ...updates } = comment as TicketCommentRow;
        const { data, error } = await supabase
          .from('ticket_comments')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      case 'delete': {
        const { error } = await supabase
          .from('ticket_comments')
          .delete()
          .eq('id', (comment as { id: string }).id);
        if (error) throw error;
        return null;
      }
    }
  } catch (err) {
    throw err;
  }
};

/**
 * A unified function to handle attachment operations
 */
const handleAttachmentOperation = async (
  operation: 'create' | 'delete',
  attachment: TicketAttachmentInsert | { id: string },
  file?: File
) => {
  try {
    switch (operation) {
      case 'create': {
        if (!file) throw new Error('File is required for creating attachments');
        
        // 1. Upload file to storage
        const fileExt = file.name.split('.').pop();
        const filePath = `${(attachment as TicketAttachmentInsert).ticket_id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('ticket-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Create attachment record with storage path
        const fullAttachment: TicketAttachmentInsert = {
          ...(attachment as TicketAttachmentInsert),
          storage_path: filePath,
        };

        const { data, error } = await supabase
          .from('ticket_attachments')
          .insert([fullAttachment])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      case 'delete': {
        // 1. Get attachment info
        const { data: existingAttachment, error: fetchError } = await supabase
          .from('ticket_attachments')
          .select()
          .eq('id', (attachment as { id: string }).id)
          .single();

        if (fetchError) throw fetchError;

        // 2. Delete from storage
        const { error: storageError } = await supabase.storage
          .from('ticket-attachments')
          .remove([existingAttachment.storage_path]);

        if (storageError) throw storageError;

        // 3. Delete record
        const { error } = await supabase
          .from('ticket_attachments')
          .delete()
          .eq('id', (attachment as { id: string }).id);

        if (error) throw error;
        return null;
      }
    }
  } catch (err) {
    throw err;
  }
};

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  selectedTicket: null,
  selectedTicketComments: [],
  selectedTicketAttachments: [],
  userProfiles: {},
  loading: false,
  error: null,
  filters: {},
  agentStats: null,
  dashboardTickets: [],

  fetchTickets: async (filters = get().filters) => {
    try {
      console.log('[TicketStore] Fetching tickets with filters:', filters);
      set({ loading: true, error: null });

      const data = await fetchTicketsUnified({
        role: useAuthStore.getState().profile?.role || 'customer',
        view: 'list',
        filters,
        limit: 50
      });

        // Fetch profiles for all users involved in tickets
      const uniqueUserIds = new Set<string>();
      data.forEach(ticket => {
        if (ticket.created_by) uniqueUserIds.add(ticket.created_by);
        if (ticket.assigned_to) uniqueUserIds.add(ticket.assigned_to);
      });
      
      const userIds = Array.from(uniqueUserIds);
      if (userIds.length > 0) {
        await get().fetchProfiles(userIds);
      }
      
      set({ tickets: data, filters });
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
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) throw new Error('User must be logged in to create a ticket');

      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          created_by: currentUser.id,
          customer_id: ticket.customer_id || currentUser.id,
          subject: ticket.subject,
          description: ticket.description,
          priority: ticket.priority,
          tags: ticket.tags,
          metadata: ticket.metadata as Json
        }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        tickets: [data, ...state.tickets],
        loading: false
      }));
      return data;
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
      
      // Get current user and their role
      const currentUser = useAuthStore.getState().user;
      const userProfile = useAuthStore.getState().profile;
      
      if (!currentUser || !userProfile) {
        throw new Error('User must be logged in to update a ticket');
      }

      // Get the current ticket to check permissions
      const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Check permissions
      const isAdmin = userProfile.role === 'admin';
      const isAssignedAgent = userProfile.role === 'agent' && ticket.assigned_to === currentUser.id;
      const isCustomerOwner = userProfile.role === 'customer' && ticket.customer_id === currentUser.id;

      if (!isAdmin && !isAssignedAgent && !isCustomerOwner) {
        throw new Error('You do not have permission to update this ticket');
      }

      const { error } = await supabase
        .from('tickets')
        .update({
          ...updates,
          metadata: updates.metadata as Json
        })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      set((state) => ({
        tickets: state.tickets.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
        selectedTicket: state.selectedTicket?.id === id 
          ? { ...state.selectedTicket, ...updates } 
          : state.selectedTicket,
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

  addComment: async (comment: Omit<TicketCommentInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      set({ loading: true, error: null });
      const data = await handleCommentOperation('create', comment);
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
      await handleCommentOperation('delete', { id });
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
      
      const attachment: TicketAttachmentInsert = {
        ticket_id: ticketId,
        comment_id: commentId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id!,
      };

      const data = await handleAttachmentOperation('create', attachment, file);
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
      await handleAttachmentOperation('delete', { id });
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

  selectTicket: async (ticketIdOrTicket: string | TicketRow | null) => {
    if (!ticketIdOrTicket) {
      set({ selectedTicket: null });
      return;
    }

    const ticketId = typeof ticketIdOrTicket === 'string' 
      ? ticketIdOrTicket 
      : ticketIdOrTicket.id;
    
    try {
      set({ loading: true, error: null });
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error) throw error;

      // Fetch profiles for the ticket's users
      if (ticket) {
        const userIds = [
          ticket.created_by,
          ...(ticket.assigned_to ? [ticket.assigned_to] : [])
        ];
        await get().fetchProfiles(userIds);
      }

      set({ selectedTicket: ticket as TicketRow });
      await get().fetchComments(ticketId);
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  setFilters: (filters: TicketFilters) => {
    set({ filters });
    get().fetchTickets(filters);
  },

  fetchAgentQueue: async () => {
    const currentUser = useAuthStore.getState().user;
    const userProfile = useAuthStore.getState().profile;
    
    if (!currentUser || !userProfile || userProfile.role !== 'agent') {
      throw new Error('Must be logged in as an agent to view queue');
    }

    return get().fetchTickets({
      status: 'open',
      assigned_to: currentUser.id
    });
  },

  assignTicket: async (ticketId: string) => {
    const currentUser = useAuthStore.getState().user;
    const userProfile = useAuthStore.getState().profile;
    
    if (!currentUser || !userProfile || userProfile.role !== 'agent') {
      throw new Error('Must be logged in as an agent to assign tickets');
    }

    // Validate the ticket exists and isn't already assigned
    const { data: ticket, error: fetchError } = await supabase
        .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (fetchError) throw fetchError;
    if (ticket.assigned_to === currentUser.id) {
      throw new Error('Ticket is already assigned to you');
    }

    // Use updateTicket for the actual update
    await get().updateTicket(ticketId, {
      assigned_to: currentUser.id,
      status: 'in_progress'
    });
  },

  updateTicketStatus: async (ticketId: string, status: TicketStatus) => {
    // Use updateTicket directly with the new status
    await get().updateTicket(ticketId, {
      status,
      closed_at: status === 'closed' ? new Date().toISOString() : null,
    });
  },

  fetchAgentDashboardData: async () => {
    try {
      const currentUser = useAuthStore.getState().user;
      const userProfile = useAuthStore.getState().profile;
      
      if (!currentUser || !userProfile || userProfile.role !== 'agent') {
        throw new Error('Must be logged in as an agent to view dashboard');
      }

      set({ loading: true, error: null });
      
      // Fetch agent stats
      const { data: agentStats, error: statsError } = await supabase
        .rpc('get_agent_performance_stats')
        .single();

      if (statsError) throw statsError;

      // Fetch recent tickets using unified function
      const dashboardTickets = await fetchTicketsUnified({
        role: 'agent',
        view: 'dashboard',
        filters: {
          assigned_to: currentUser.id
        },
        limit: 10
      });

      set({ 
        agentStats,
        dashboardTickets,
        loading: false 
      });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    }
  },

  fetchProfiles: async (userIds: string[]) => {
    try {
      const uniqueIds = Array.from(new Set(userIds));
      const existingIds = Object.keys(get().userProfiles);
      const missingIds = uniqueIds.filter(id => !existingIds.includes(id));
      
      if (missingIds.length === 0) return;
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', missingIds);

      if (error) throw error;

      console.log(profiles);
      console.log("======================== ")
      
      if (profiles) {
        set((state) => ({
          userProfiles: {
            ...state.userProfiles,
            ...profiles.reduce((acc, profile) => {
              acc[profile.id] = profile as UserProfile;
              return acc;
            }, {} as Record<string, UserProfile>)
          }
        }));

        console.log(get().userProfiles);
      }
    } catch (err) {
      console.error('[TicketStore] Error fetching profiles:', err);
    }
  },
})); 