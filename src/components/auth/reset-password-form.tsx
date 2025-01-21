import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '@/components/ui/form-input';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/authStore';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, loading, error } = useAuthStore();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is already handled by the auth store
      console.error('Reset password request failed:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Check your email
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          We've sent you a link to reset your password. Please check your email.
        </p>
        <button
          onClick={() => navigate('/auth/login')}
          className="mt-4 text-sm font-semibold text-primary hover:text-primary/90"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Reset your password
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <FormInput<ResetPasswordFormData>
        id="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        register={register}
        errors={errors}
        required
      />
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error resetting password
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
        {loading ? 'Sending reset link...' : 'Send reset link'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Remember your password?{' '}
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