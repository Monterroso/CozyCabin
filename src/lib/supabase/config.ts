// Supabase URLs and configurations
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Edge Function URLs
export const EDGE_FUNCTION_URLS = {
  adminAgent: `${SUPABASE_URL}/functions/v1/adminAgent`,
} as const;

// Function to get headers for Edge Function calls
export const getEdgeFunctionHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
}); 