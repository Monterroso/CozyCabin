import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '@/components/ui/form-input';
import { newPasswordSchema, type NewPasswordFormData } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/authStore';

export const NewPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword, loading, error } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    try {
      await updatePassword(data.password);
      navigate('/auth/login', { 
        state: { message: 'Password updated successfully. Please sign in with your new password.' }
      });
    } catch (error) {
      // Error is already handled by the auth store
      console.error('Password update failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Create new password
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Please enter your new password below.
        </p>
      </div>

      <FormInput<NewPasswordFormData>
        id="password"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
        register={register}
        errors={errors}
        required
      />
      <FormInput<NewPasswordFormData>
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        placeholder="Confirm your new password"
        register={register}
        errors={errors}
        required
      />
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error updating password
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
        {loading ? 'Updating password...' : 'Update password'}
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