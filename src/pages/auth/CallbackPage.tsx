import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the auth code from the URL
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/';

        if (code) {
          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }

          toast({
            title: 'Email verified',
            description: 'Your email has been verified successfully.',
          });

          // Redirect to the next URL or dashboard
          navigate(next);
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        toast({
          title: 'Verification failed',
          description: error instanceof Error ? error.message : 'Failed to verify email',
          variant: 'destructive',
        });
        navigate('/auth/login');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Verifying your email...</p>
    </div>
  );
} 