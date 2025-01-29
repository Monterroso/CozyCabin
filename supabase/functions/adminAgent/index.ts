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
  const responseHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: responseHeaders
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        reply: "Method not allowed",
        error: "Only POST requests are accepted"
      }),
      {
        status: 405,
        headers: responseHeaders
      }
    );
  }

  try {
    const requestData: AdminAgentRequest = await req.json();
    
    if (!requestData.messages || !requestData.newUserMessage) {
      throw new Error('Invalid request format');
    }

    console.log('Processing request with message:', requestData.newUserMessage);
    const response = await handleAdminAgentRequest(
      requestData.messages,
      requestData.newUserMessage
    );
    console.log('Raw response from agent:', response);

    // Ensure we have a valid response object with required fields
    if (!response) {
      console.error('Response is undefined or null');
      throw new Error('Invalid response from AI agent: Response is undefined');
    }

    if (typeof response.reply !== 'string') {
      console.error('Response.reply is not a string:', response.reply);
      throw new Error('Invalid response from AI agent: Reply is not a string');
    }

    const responseBody = {
      reply: response.reply,
      error: response.error
    };

    console.log('Sending response:', responseBody);

    return new Response(
      JSON.stringify(responseBody),
      {
        headers: responseHeaders,
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in Edge Function:', error);
    
    const errorResponse = {
      reply: "An error occurred while processing your request.",
      error: error instanceof Error ? error.message : "Unknown error"
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: responseHeaders,
        status: 400
      }
    );
  }
}); 
