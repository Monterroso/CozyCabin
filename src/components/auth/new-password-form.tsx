import React from 'react';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { newPasswordSchema, type NewPasswordFormData } from '@/lib/validations/auth';
import { useAuthStore } from '@/stores/authStore';

export const NewPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword, loading, error } = useAuthStore();
  
  const form = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    try {
      await updatePassword(data.password);
      navigate('/login', { 
        state: { message: 'Password updated successfully. Please sign in with your new password.' }
      });
    } catch (error) {
      // Error is already handled by the auth store
      console.error('Password update failed:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-lodge-brown mb-2">
            Create new password
          </h3>
          <p className="text-pine-green-600">
            Please enter your new password below.
          </p>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-pine-green-700">New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Enter your new password"
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
              <FormLabel className="text-pine-green-700">Confirm New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Confirm your new password"
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
            <AlertTitle className="text-ember-orange-700">Error updating password</AlertTitle>
            <AlertDescription className="text-ember-orange-600">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-lodge-brown hover:bg-lodge-brown-600 text-white"
          disabled={loading}
        >
          {loading ? 'Updating password...' : 'Update password'}
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