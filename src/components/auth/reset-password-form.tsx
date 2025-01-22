import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/authStore';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, loading, error } = useAuthStore();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
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
        <h3 className="text-2xl font-bold text-lodge-brown mb-2">
          Check your email
        </h3>
        <p className="mt-2 text-pine-green-600">
          We've sent you a link to reset your password. Please check your email.
        </p>
        <Button
          onClick={() => navigate('/login')}
          variant="link"
          className="mt-4 text-lodge-brown hover:text-lodge-brown-700"
        >
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-lodge-brown mb-2">
            Reset your password
          </h3>
          <p className="text-pine-green-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

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
        
        {error && (
          <Alert variant="destructive" className="border-ember-orange-200 bg-ember-orange-50">
            <AlertCircle className="h-4 w-4 text-ember-orange-500" />
            <AlertTitle className="text-ember-orange-700">Error resetting password</AlertTitle>
            <AlertDescription className="text-ember-orange-600">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-lodge-brown hover:bg-lodge-brown-600 text-white"
          disabled={loading}
        >
          {loading ? 'Sending reset link...' : 'Send reset link'}
        </Button>

        <p className="text-center text-sm text-pine-green-600">
          Remember your password?{' '}
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