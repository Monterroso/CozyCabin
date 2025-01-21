/**
 * useSupabase.ts
 * Hook for accessing the Supabase client instance
 */

import { useContext } from 'react'
import { SupabaseContext } from '@/lib/supabase'

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 