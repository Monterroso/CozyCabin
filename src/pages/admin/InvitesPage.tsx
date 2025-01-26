import { useState, useEffect, useTransition, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { InviteList } from "@/components/invites/invite-list";
import { inviteSchema, type CreateInviteRequest } from "@/lib/types/invites";
import { useInviteStore } from "@/stores/inviteStore";
import type { z } from "zod";

type FormData = z.infer<typeof inviteSchema>;

export default function InvitesPage() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { invites, loading, error, fetchInvites, createInvite } = useInviteStore();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "agent",
    },
  });

  useEffect(() => {
    startTransition(() => {
      fetchInvites();
    });
  }, [fetchInvites]);

  const onSubmit = form.handleSubmit(async (data: FormData) => {
    console.log('Creating invite with data:', data);
    try {
      await createInvite(data);
      console.log('Invite created successfully');
      startTransition(() => {
        setIsCreating(false);
        form.reset();
      });
      toast({
        title: "Invite sent",
        description: "The invite has been sent successfully.",
      });
    } catch (err) {
      console.error('Failed to create invite:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invite';
      console.error('Error details:', { error, errorMessage, originalError: err });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invites</h1>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || isPending}>
          Create Invite
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 mb-8">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Email address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="agent">Support Agent</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || isPending}
                >
                  Send Invite
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <InviteList invites={invites} loading={loading || isPending} />
      </Suspense>
    </div>
  );
} 