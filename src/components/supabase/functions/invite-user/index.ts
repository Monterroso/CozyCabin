import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Initialize Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Only POST requests allowed", { status: 405 });
  }

  try {
    const { email, role } = await req.json() as { email?: string; role?: string };

    if (!email || !role) {
      return new Response("Missing 'email' or 'role' in request body.", {
        status: 400,
      });
    }

    // Optional: Validate role is allowed (admin or agent, etc.)
    if (!["admin", "agent"].includes(role)) {
      return new Response("Invalid role", { status: 400 });
    }

    // Use Supabase admin API to invite user.
    // This automatically sends an invite/confirmation email (assuming SMTP is set up).
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      // Pass in user metadata so your DB trigger can assign the correct role
      // in the 'profiles' table.
      data: { role },
    });

    if (error) {
      return new Response(`Error inviting user: ${error.message}`, { status: 400 });
    }

    // If you also want to manually create a record in your “invites” table
    // for tracking, you can do so here. Or rely on your existing triggers.

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(err.message || "Server error", { status: 500 });
  }
});