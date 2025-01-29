import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Database } from "../_shared/database.types.ts";
import { handleAdminAgentRequest } from "../tools/agentOrchestrator.ts";

// Initialize Supabase client
const supabaseClient = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);

interface AdminAgentRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  newUserMessage: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
      }
    });
  }

  try {
    const requestData: AdminAgentRequest = await req.json();
    if (!requestData.messages || !requestData.newUserMessage) {
      throw new Error('Invalid request format');
    }

    const reply = await handleAdminAgentRequest(
      requestData.messages,
      requestData.newUserMessage
    );

    return new Response(JSON.stringify({ reply }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
      },
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
      },
      status: 400
    });
  }
}); 
