/**
 * SupabaseProvider.tsx
 * Provider component for Supabase client access
 */

import { createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'

const SupabaseContext = createContext(supabase)

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

interface SupabaseProviderProps {
  children: React.ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
} 