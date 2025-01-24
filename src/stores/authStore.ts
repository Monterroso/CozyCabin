import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/types/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  cleanup: () => void;
}

interface ProfileActions {
  updateProfile: (updates: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Helper function to transform raw user data into our UserProfile format
const transformUserToProfile = (user: User): UserProfile => {
  return {
    id: user.id,
    email: user.email ?? '',
    name: user.user_metadata.full_name ?? '',
    role: user.user_metadata.role as UserRole ?? 'customer', // Type assertion here
  };
};

export const useAuthStore = create<AuthState & AuthActions & ProfileActions>((set, get) => {
  let authListener: (() => void) | null = null;

  // Helper function to fetch profile
  const fetchProfile = async (userId: string) => {
    console.log('[AuthStore] Fetching profile for user:', userId);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    console.log('[AuthStore] Profile fetch response:', profile);
    return profile as UserProfile;
  };

  // Helper function to handle auth state changes
  const handleAuthStateChange = async (session: Session | null) => {
    console.log('[AuthStore] Auth state changed:', session ? 'Session exists' : 'No session');
    if (session?.user) {
      try {
        const user = session.user as User;
        const profile = await fetchProfile(user.id);
        
        // Update user metadata if needed
        if (!user.user_metadata.role || !user.user_metadata.full_name) {
          await supabase.auth.updateUser({
            data: {
              role: profile.role,
              full_name: profile.name,
            },
          });
        }

        set({
          user,
          session,
          profile,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('[AuthStore] Error handling auth state change:', error);
        set({
          user: session.user as User,
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
        error: null,
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
        console.log('[AuthStore] Initializing auth state');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AuthStore] Got initial session:', session ? 'Session exists' : 'No session');
        await handleAuthStateChange(session);
        set({ initialized: true });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            console.log('[AuthStore] Auth state change event received');
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

    loginWithProvider: async (provider: 'google' | 'github') => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) throw error;
        
        // Note: We don't need to call handleAuthStateChange here
        // The auth state listener will handle the session update after redirect
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : `Failed to login with ${provider}`,
          isLoading: false,
        });
      }
    },

    signUp: async (email: string, password: string, name: string, role: UserRole = 'customer') => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: role,  // Use the provided role or default to customer
            }
          }
        });

        if (error) throw error;
        await handleAuthStateChange(data.session);
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

    updatePassword: async (password: string) => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase.auth.updateUser({
          password: password
        });
        if (error) throw error;
        set({ isLoading: false });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to update password',
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
        
        // Update profile in database
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (profileError) throw profileError;

        // Update user metadata to keep it in sync
        const { error: userError } = await supabase.auth.updateUser({
          data: {
            full_name: updates.name,
            role: updates.role,
          }
        });

        if (userError) throw userError;

        set({ 
          profile: profileData as UserProfile,
          user: {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              full_name: updates.name ?? user.user_metadata.full_name,
              role: updates.role ?? user.user_metadata.role,
            }
          },
          isLoading: false,
          error: null,
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
        
        // Also refresh user metadata to keep it in sync
        await supabase.auth.updateUser({
          data: {
            full_name: profile.name,
            role: profile.role,
          }
        });

        set({ 
          profile,
          user: {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              full_name: profile.name,
              role: profile.role,
            }
          },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Failed to refresh profile',
          isLoading: false,
        });
      }
    },
  };
}); 