import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'customer';
}

// Core auth state
interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
}

// Separate interfaces for different types of actions
interface AuthActions {
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  cleanup: () => void;
}

interface ProfileActions {
  updateProfile: (updates: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions & ProfileActions>((set, get) => {
  let authListener: (() => void) | null = null;

  // Helper function to fetch profile
  const fetchProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return profile as UserProfile;
  };

  // Helper function to handle auth state changes
  const handleAuthStateChange = async (session: Session | null) => {
    if (session?.user) {
      try {
        const profile = await fetchProfile(session.user.id);
        set({
          user: session.user,
          session,
          profile,
          isLoading: false,
        });
      } catch (error) {
        set({
          user: session.user,
          session,
          profile: null,
          error: 'Failed to fetch user profile',
          isLoading: false,
        });
      }
    } else {
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
      });
    }
  };

  return {
    // Initial state
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    initialized: false,
    error: null,

    // Auth actions
    initialize: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await handleAuthStateChange(session);
        set({ initialized: true });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            await handleAuthStateChange(session);
          }
        );

        authListener = () => subscription.unsubscribe();
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to initialize auth',
          isLoading: false,
          initialized: true,
        });
      }
    },

    cleanup: () => {
      if (authListener) {
        authListener();
        authListener = null;
      }
    },

    login: async (email: string, password: string) => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        await handleAuthStateChange(data.session);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to login',
          isLoading: false,
        });
      }
    },

    signUp: async (email: string, password: string, name: string) => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email,
                name,
                role: 'customer', // Default role for new users
              },
            ]);

          if (profileError) throw profileError;
          await handleAuthStateChange(data.session);
        }
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to sign up',
          isLoading: false,
        });
      }
    },

    logout: async () => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        await handleAuthStateChange(null);
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to logout',
          isLoading: false,
        });
      }
    },

    resetPassword: async (email: string) => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        set({ isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to reset password',
          isLoading: false,
        });
      }
    },

    // Profile actions
    updateProfile: async (updates: Partial<Omit<UserProfile, 'id'>>) => {
      const { user } = get();
      if (!user) return;

      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        set({ 
          profile: data as UserProfile,
          isLoading: false 
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to update profile',
          isLoading: false,
        });
      }
    },

    refreshProfile: async () => {
      const { user } = get();
      if (!user) return;

      try {
        set({ isLoading: true, error: null });
        const profile = await fetchProfile(user.id);
        set({ profile, isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to refresh profile',
          isLoading: false,
        });
      }
    },
  };
}); 