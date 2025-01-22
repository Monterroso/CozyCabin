/**
 * App.tsx
 * Main application component with routing setup.
 */

import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from '@/routes/index';

export default function App() {
  return (
    <SupabaseProvider>
      <UserProvider>
        <AppRoutes />
        <Toaster />
      </UserProvider>
    </SupabaseProvider>
  );
} 