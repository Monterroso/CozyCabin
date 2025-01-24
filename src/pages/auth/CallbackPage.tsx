import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { error, session, isLoading } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if this is an email verification callback
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/';

        if (code) {
          // Handle email verification
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;

          toast({
            title: 'Email verified',
            description: 'Your email has been verified successfully.',
          });

          // Redirect to the next URL or dashboard
          navigate(next, { replace: true });
          return;
        }

        // Handle OAuth callback
        if (error) {
          navigate('/auth/login', { 
            replace: true,
            state: { error: 'Authentication failed. Please try again.' }
          });
          return;
        }

        // If we have a session from OAuth, redirect to home
        if (session) {
          navigate('/', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast({
          title: 'Authentication failed',
          description: error instanceof Error ? error.message : 'Failed to complete authentication',
          variant: 'destructive',
        });
        navigate('/auth/login', { replace: true });
      }
    };

    handleCallback();
  }, [error, session, navigate, searchParams, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-lodge-brown" />
        <p className="mt-4 text-pine-green-600">
          {isLoading ? "Completing authentication..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
} 