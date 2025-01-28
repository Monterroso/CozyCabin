import { createClient } from "@supabase/supabase-js";
import type { Database } from "../_shared/database.types";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function getUnassignedTickets() {
  try {
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select(`
        id,
        subject,
        description,
        status,
        priority,
        created_at,
        updated_at,
        ticket_number,
        customer_id,
        profiles!customer_id (
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

    return tickets || [];
  } catch (error) {
    console.error("Error in getUnassignedTickets:", error);
    throw error;
  }
} 