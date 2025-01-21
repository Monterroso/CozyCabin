import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '@/components/ui/form-input';
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth';
import { supabase } from '@/lib/supabase';

export const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting signup with redirect:', 'https://cozy-cabin-omega.vercel.app/auth/callback');

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'customer'
          },
          emailRedirectTo: 'https://cozy-cabin-omega.vercel.app/auth/callback'
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

      // Since email confirmation is disabled, redirect to dashboard
      navigate('/dashboard/customer');
      
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput<SignUpFormData>
        id="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        register={register}
        errors={errors}
        required
      />
      <FormInput<SignUpFormData>
        id="fullName"
        label="Full Name"
        placeholder="Enter your full name"
        register={register}
        errors={errors}
        required
      />
      <FormInput<SignUpFormData>
        id="password"
        label="Password"
        type="password"
        placeholder="Create a password"
        register={register}
        errors={errors}
        required
      />
      <FormInput<SignUpFormData>
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        register={register}
        errors={errors}
        required
      />
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error signing up
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a
          href="/auth/login"
          className="font-semibold text-primary hover:text-primary/90"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}; 