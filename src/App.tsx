/**
 * App.tsx
 * Main application component with routing setup.
 */

import { useEffect } from 'react';
import { AppRoutes } from './routes';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

export default function App() {
  const { initialize, isInitialized, isLoading } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lodge-brown"></div>
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
} 