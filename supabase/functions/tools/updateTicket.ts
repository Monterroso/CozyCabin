import { createClient } from "@supabase/supabase-js";
import type { Database } from "../_shared/database.types";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

type TicketUpdate = Partial<{
  assigned_to: string | null;
  category: Database["public"]["Enums"]["ticket_category"] | null;
  status: Database["public"]["Enums"]["ticket_status"];
  priority: Database["public"]["Enums"]["ticket_priority"];
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
}>;

export async function updateTicket(
  ticketId: string,
  updates: TicketUpdate,
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  ticket?: Database["public"]["Tables"]["tickets"]["Row"];
}> {
  try {
    // First, check if the ticket exists
    const { data: existingTicket, error: fetchError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (fetchError || !existingTicket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    // If we're updating status to closed, add closed_at timestamp
    const finalUpdates: TicketUpdate & { closed_at?: string | null } = {
      ...updates,
      ...(updates.status === "closed" ? { closed_at: new Date().toISOString() } : {}),
    };

    // If we're updating from closed to another status, clear closed_at
    if (existingTicket.status === "closed" && updates.status && updates.status !== "closed") {
      finalUpdates.closed_at = null;
    }

    // Add reason to metadata if provided
    if (reason) {
      finalUpdates.metadata = {
        ...(existingTicket.metadata as Record<string, unknown>),
        lastUpdateReason: reason,
        lastUpdateTimestamp: new Date().toISOString(),
      };
    }

    // Perform the update
    const { data: updatedTicket, error: updateError } = await supabase
      .from("tickets")
      .update(finalUpdates)
      .eq("id", ticketId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    };

  } catch (error) {
    console.error("Error in updateTicket:", error);
    return {
      success: false,
      message: error.message || "Failed to update ticket",
    };
  }
} 