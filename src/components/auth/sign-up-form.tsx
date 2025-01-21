import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '@/components/ui/form-input';
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';

export const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading, error } = useAuthStore();
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await signUp(data.email, data.password, data.fullName);
      // After successful signup, check if user has a role
      if (user?.role) {
        navigate(`/dashboard/${user.role}`);
      } else {
        // Default to customer dashboard if no role is specified
        navigate('/dashboard/customer');
      }
    } catch (error) {
      // Error is already handled by the auth store
      console.error('Sign up failed:', error);
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