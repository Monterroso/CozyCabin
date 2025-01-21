import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '@/components/ui/form-input';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading, error } = useAuthStore();
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      // The useAuth hook will automatically update with the user's role
      if (user?.role) {
        navigate(`/dashboard/${user.role}`);
      } else {
        // Default to customer dashboard if no role is specified
        navigate('/dashboard/customer');
      }
    } catch (error) {
      // Error is already handled by the auth store
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput<LoginFormData>
        id="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        register={register}
        errors={errors}
        required
      />
      <FormInput<LoginFormData>
        id="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        register={register}
        errors={errors}
        required
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="remember"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-100"
          >
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a
            href="/auth/reset-password"
            className="font-semibold text-primary hover:text-primary/90"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <a
          href="/signup"
          className="font-semibold text-primary hover:text-primary/90"
        >
          Sign up
        </a>
      </p>
    </form>
  );
}; 