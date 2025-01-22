import React, { useState } from 'react';
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
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth';
import { supabase } from '@/lib/supabase';
import { getBaseUrl } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { UserRole } from '@/lib/types/supabase';

interface SignUpFormProps {
  inviteData?: {
    email: string;
    role: UserRole;
  } | null;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ inviteData }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: inviteData?.email || '',
      role: inviteData?.role || 'customer',
      fullName: '',
      password: '',
      confirmPassword: '',
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setLoading(true);
      setError(null);

      const redirectUrl = `${getBaseUrl()}/auth/callback`;
      console.log('Attempting signup with redirect:', redirectUrl);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: inviteData?.role || 'customer'
          },
          emailRedirectTo: redirectUrl
        }
      });

      if (signUpError) {
        console.error('Signup error full details:', {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name,
          stack: signUpError.stack
        });
        // Handle specific error cases
        if (signUpError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists');
        }
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Show success message and instruct user to check email
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account.',
      });
      
    } catch (err) {
      console.error('Signup error details:', {
        error: err,
        type: err instanceof Error ? 'Error' : typeof err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      
      // More specific error messages
      let errorMessage = 'An error occurred during signup';
      if (err instanceof Error) {
        if (err.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists';
        } else if (err.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address';
        } else if (err.message.includes('Password')) {
          errorMessage = 'Password does not meet requirements';
        }
      }
      setError(errorMessage);
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
                  disabled={!!inviteData}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-ember-orange-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-pine-green-700">Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your full name"
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
                  placeholder="Create a password"
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-pine-green-700">Confirm Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Confirm your password"
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
            <AlertTitle className="text-ember-orange-700">Error signing up</AlertTitle>
            <AlertDescription className="text-ember-orange-600">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-lodge-brown hover:bg-lodge-brown-600 text-white"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-pine-green-600">
          Already have an account?{' '}
          <a
            href="/login"
            className="font-semibold text-lodge-brown hover:text-lodge-brown-700 transition-colors"
          >
            Sign in
          </a>
        </p>
      </form>
    </Form>
  );
};