import { EDGE_FUNCTION_URLS, getEdgeFunctionHeaders } from "@/lib/supabase/config";
import type { AdminAgentRequest, AdminAgentResponse } from "@/lib/types/admin";
import { adminAgentResponseSchema } from "@/lib/schemas/admin";

export const useEdgeFunctions = () => {
  const callAdminAgent = async (payload: AdminAgentRequest): Promise<AdminAgentResponse> => {
    const response = await fetch(EDGE_FUNCTION_URLS.adminAgent, {
      method: "POST",
      headers: getEdgeFunctionHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get response from AI assistant");
    }

    const data = await response.json();
    return adminAgentResponseSchema.parse(data);
  };

  return {
    callAdminAgent,
  };
}; 