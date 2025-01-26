import { useState, useEffect } from "react";
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
import { inviteSchema, type Invite, type CreateInviteRequest } from "@/lib/types/invites";
import { useInviteStore } from "@/stores/inviteStore";
import type { z } from "zod";

type FormData = z.infer<typeof inviteSchema>;

export default function InvitesPage() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { invites, loading, error, fetchInvites, createInvite } = useInviteStore();

  const form = useForm<FormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "agent",
    },
  });

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const onSubmit = form.handleSubmit(async (data: FormData) => {
    try {
      await createInvite(data);
      setIsCreating(false);
      form.reset();
      toast({
        title: "Invite sent",
        description: "The invite has been sent successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: error || "Failed to send invite",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invites</h1>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  Send Invite
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {invites?.map((invite: Invite) => (
            <Card key={invite.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Role: {invite.role}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {invite.used_at ? (
                    <span>Used on {new Date(invite.used_at).toLocaleDateString()}</span>
                  ) : (
                    <span>Expires on {new Date(invite.expires_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 