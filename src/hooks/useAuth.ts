import { useAuthStore } from '@/stores/authStore';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/stores/authStore';

export interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Profile methods
  updateProfile: (updates: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const {
    user,
    profile,
    isLoading,
    error,
    initialized: isInitialized,
    login,
    signUp,
    logout,
    resetPassword,
    updateProfile,
    refreshProfile,
  } = useAuthStore();

  return {
    user,
    profile,
    isLoading,
    error,
    isInitialized,
    login,
    signUp,
    logout,
    resetPassword,
    updateProfile,
    refreshProfile,
  };
} 