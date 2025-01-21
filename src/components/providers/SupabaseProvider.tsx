/**
 * SupabaseProvider.tsx
 * Provider component for Supabase client access
 */

import { ReactNode } from 'react'
import { SupabaseContext, supabase } from '@/lib/supabase'

interface SupabaseProviderProps {
  children: ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
} 