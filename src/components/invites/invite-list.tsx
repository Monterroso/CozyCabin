import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Invite } from "@/lib/types/invites";

interface InviteListProps {
  invites: Invite[];
  loading: boolean;
}

export function InviteList({ invites, loading }: InviteListProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      {invites?.map((invite) => (
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
  );
} 