/**
 * Supabase Client Configuration
 * 
 * Centralizes Supabase client initialization and provides typed database interface.
 * This is the only place where we initialize the Supabase client.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/supabase'

// Environment validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Initialize the Supabase client with proper typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Type helpers for database tables and enums
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

/**
 * Hook to access the Supabase client.
 * Use this when you need direct access to the Supabase client.
 * For auth operations, use useAuth() instead.
 */
export function useSupabase() {
  return supabase;
} 