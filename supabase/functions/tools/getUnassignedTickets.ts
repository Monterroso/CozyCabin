import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import type { Database } from "../_shared/database.types.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function getUnassignedTickets() {
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      *,
      profiles:customer_id (
        full_name,
        email
      )
    `)
    .is("assigned_to", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching unassigned tickets:", error);
    throw error;
  }

  return data || [];
} 