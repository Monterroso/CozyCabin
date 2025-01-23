/**
 * App.tsx
 * Main application component with routing setup.
 */

import { Toaster } from '@/components/ui/toaster';
import { AppRoutes } from '@/routes/index';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function App() {
  // Use individual selectors to prevent unnecessary re-renders
  const initialize = useAuthStore((state) => state.initialize);
  const initialized = useAuthStore((state) => state.initialized);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  // Don't render routes until auth is initialized
  if (!initialized || isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
} 