import { z } from "zod";
import { UserRole } from "./supabase";

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "agent"] as const)
});

export type Invite = {
  id: string;
  email: string;
  role: UserRole;
  invited_by: string;
  token: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

export type CreateInviteRequest = z.infer<typeof inviteSchema>;
export type VerifyInviteResponse = {
  is_valid: boolean;
  invite_email: string | null;
  invite_role: UserRole | null;
} 