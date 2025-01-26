import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Invite, CreateInviteRequest } from '@/lib/types/invites';

interface InviteState {
  invites: Invite[];
  loading: boolean;
  error: string | null;
  fetchInvites: () => Promise<void>;
  createInvite: (data: CreateInviteRequest) => Promise<void>;
}

export const useInviteStore = create<InviteState>((set, get) => ({
  invites: [],
  loading: false,
  error: null,

  fetchInvites: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ invites: data || [] });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createInvite: async (data: CreateInviteRequest) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.rpc('create_invite', {
        invite_email: data.email,
        invite_role: data.role
      });

      if (error) throw error;
      
      // Refresh the invites list
      await get().fetchInvites();
    } catch (err) {
      const error = err as Error;
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
})); 