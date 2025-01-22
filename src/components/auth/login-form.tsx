import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!authData.user) {
        throw new Error('Failed to sign in');
      }

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      // Redirect to appropriate dashboard based on role
      if (profile?.role) {
        navigate(`/dashboard/${profile.role}`);
      } else {
        navigate('/dashboard/customer'); // Default to customer dashboard
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'An error occurred during sign in';
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (err.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address';
        }
      }
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-pine-green-700">Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  className="border-pine-green-200 focus:border-pine-green-500 focus:ring-pine-green-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-ember-orange-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-pine-green-700">Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your password"
                  className="border-pine-green-200 focus:border-pine-green-500 focus:ring-pine-green-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-ember-orange-500" />
            </FormItem>
          )}
        />
        
        {error && (
          <Alert variant="destructive" className="border-ember-orange-200 bg-ember-orange-50">
            <AlertCircle className="h-4 w-4 text-ember-orange-500" />
            <AlertTitle className="text-ember-orange-700">Error</AlertTitle>
            <AlertDescription className="text-ember-orange-600">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-lodge-brown hover:bg-lodge-brown-600 text-white"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-pine-green-600">
          Don't have an account?{' '}
          <a
            href="/signup"
            className="font-semibold text-lodge-brown hover:text-lodge-brown-700 transition-colors"
          >
            Sign up
          </a>
        </p>
      </form>
    </Form>
  );
} 