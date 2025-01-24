import { useAuthStore } from '@/stores/authStore';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/stores/authStore';

export interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  cleanup: () => void;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  
  // Profile methods
  updateProfile: (updates: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const {
    user,
    profile,
    session,
    isLoading,
    error,
    initialized,
    initialize,
    cleanup,
    login,
    loginWithProvider,
    signUp,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  } = useAuthStore();

  return {
    user,
    profile,
    session,
    isLoading,
    error,
    isInitialized: initialized,
    initialized,
    initialize,
    cleanup,
    login,
    loginWithProvider,
    signUp,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };
} 