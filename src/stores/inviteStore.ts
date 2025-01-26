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
      console.log('Fetching invites...');
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched invites:', data);
      set({ invites: data || [] });
    } catch (err) {
      console.error('Error fetching invites:', err);
      const error = err as Error;
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createInvite: async (data: CreateInviteRequest) => {
    try {
      set({ loading: true, error: null });
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      if (!session.access_token) {
        throw new Error('No access token available');
      }

      console.log('Current user session:', {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role,
          metadata: session.user.user_metadata
        },
        token: session.access_token.slice(0, 20) + '...',
        tokenLength: session.access_token.length
      });
      
      // Verify user has admin role before making request
      if (!session.user.user_metadata?.role || session.user.user_metadata.role !== 'admin') {
        throw new Error(`You must be an admin to create invites. Current role: ${session.user.user_metadata?.role}`);
      }

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-invite`;
      
      console.log('Making invite request to:', url);
      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
      console.log('Request headers:', {
        ...headers,
        Authorization: headers.Authorization.slice(0, 20) + '...',
        tokenType: typeof session.access_token
      });
      
      const body = {
        email: data.email,
        role: data.role,
      };
      console.log('Request body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        mode: 'cors',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const responseData = await response.json();
        console.error('Invite creation failed:', responseData);
        throw new Error(responseData.error || 'Failed to create invite');
      }

      const result = await response.json();
      console.log('Invite creation successful:', result);

      // Refresh the invites list
      await get().fetchInvites();
    } catch (err) {
      console.error('Error in createInvite:', err);
      const error = err as Error;
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
})); 