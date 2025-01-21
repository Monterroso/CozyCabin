/**
 * App.tsx
 * Root application component with providers and routing
 */

import { BrowserRouter } from 'react-router-dom'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { Toaster } from '@/components/ui/toaster'
import { AppRoutes } from '@/routes'

export function App() {
  return (
    <BrowserRouter>
      <SupabaseProvider>
        <AppRoutes />
        <Toaster />
      </SupabaseProvider>
    </BrowserRouter>
  )
}

export default App; 