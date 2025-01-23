import { supabase } from "../supabase";
import { CreateInviteRequest, Invite, VerifyInviteResponse } from "@/lib/types/invites";

export async function createInvite(data: CreateInviteRequest): Promise<string> {
  const { data: token, error } = await supabase
    .rpc('create_invite', {
      invite_email: data.email,
      invite_role: data.role
    });

  if (error) throw error;
  return token;
}

export async function getInvites(): Promise<Invite[]> {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function verifyInvite(token: string): Promise<VerifyInviteResponse> {
  const { data, error } = await supabase
    .rpc('verify_invite', {
      token
    });

  if (error) throw error;
  return data[0];
} 