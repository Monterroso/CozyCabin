import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

interface InvitePayload {
  email: string
  role: 'agent' | 'admin'
}

serve(async (req) => {
    console.log("New request incoming:", req.method);
    // Log all headers individually
    console.log("=== Request Headers ===");
    const headerObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
        headerObj[key] = value;
    });
    console.log("Headers as JSON:", JSON.stringify(headerObj, null, 2));
    console.log("=== End Headers ===");

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                ...corsHeaders,
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    try {
      console.log("Handling invite...");
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        throw new Error('No authorization header');
      }

      // Create a Supabase client with the Auth context of the function
      console.log("Auth header found:", authHeader);
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing environment variables');
      }

      // First verify the JWT token
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user: authUser }, error: authError } = await createClient(
        supabaseUrl,
        supabaseServiceKey
      ).auth.getUser(jwt);

      if (authError || !authUser) {
        throw new Error(`Invalid JWT token: ${authError?.message || 'No user found'}`);
      }

      console.log("JWT verification successful:", {
        userId: authUser.id,
        email: authUser.email,
        role: authUser.role
      });

      // Create a client with user's JWT for RPC calls
      const userClient = createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          },
          global: {
            headers: {
              Authorization: authHeader
            },
          },
        }
      )

      // Create admin client for privileged operations
      const adminClient = createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
          global: {
            headers: {
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`
            },
          },
        }
      )

      // Verify the user has admin role
      console.log("Checking user role:", {
        hasMetadata: !!authUser.user_metadata,
        role: authUser.user_metadata?.role,
        allMetadata: authUser.user_metadata
      });
      
      if (!authUser.user_metadata?.role || authUser.user_metadata.role !== 'admin') {
        throw new Error(`User does not have admin privileges. Current role: ${authUser.user_metadata?.role}`);
      }

      // Parse request body
      const { email, role } = await req.json() as InvitePayload
      console.log("Parsed request body:", { email, role });

      // Call the create_invite function using user's context
      console.log("Calling create_invite RPC...");
      const { data: inviteData, error: inviteError } = await userClient
        .rpc('create_invite', {
          invite_email: email,
          invite_role: role,
        })

      console.log("Create invite response:", { inviteData, error: inviteError });

      if (inviteError) {
        throw inviteError
      }

      // Get the invite token
      const inviteToken = inviteData
      console.log("Got invite token:", inviteToken);

      // Generate the invite URL
      const siteUrl = Deno.env.get('SITE_URL')
      if (!siteUrl) {
        throw new Error('SITE_URL environment variable is not set')
      }
      const inviteUrl = `${siteUrl}/auth/signup?token=${inviteToken}`
      console.log("Generated invite URL:", inviteUrl);

      // Send the invite email using the admin client
      console.log("Attempting to send invite email to:", email);
      const { data: emailData, error: emailError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: inviteUrl,
        data: {
          role: role,
          invite_token: inviteToken
        }
      })

      if (emailError) {
        console.error("Email error details:", {
          error: emailError,
          message: emailError.message,
          status: emailError.status,
          stack: emailError.stack
        });
        throw new Error(`Failed to send invite email: ${emailError.message}`);
      }

      console.log("Email invitation sent successfully:", emailData);

      return new Response(
        JSON.stringify({ message: 'Invite sent successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (error) {
      console.error("Error encountered in handle-invite:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
}) 