import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AdminStore, Message, AdminAgentRequest } from "@/lib/types/admin";
import { EDGE_FUNCTION_URLS, getEdgeFunctionHeaders } from "@/lib/supabase/config";
import { adminAgentResponseSchema } from "@/lib/schemas/admin";

export const useAdminStore = create<AdminStore>()(
  devtools(
    (set, get) => ({
      messages: [],
      isProcessing: false,
      error: null,

      // Basic state updates
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      setProcessing: (status) =>
        set({ isProcessing: status }),

      clearMessages: () =>
        set({ messages: [] }),

      setError: (error) =>
        set({ error }),

      // Complex actions
      sendMessage: async (content: string) => {
        const { addMessage, setProcessing, setError } = get();
        
        try {
          setProcessing(true);
          setError(null);

          // Add user message
          const userMessage: Message = {
            role: "user",
            content,
            timestamp: new Date(),
          };
          addMessage(userMessage);

          // Prepare request payload
          const payload: AdminAgentRequest = {
            messages: get().messages,
            newUserMessage: content,
          };

          // Call the Edge Function
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
          const validatedData = adminAgentResponseSchema.parse(data);

          // Add AI response
          const assistantMessage: Message = {
            role: "assistant",
            content: validatedData.reply,
            timestamp: new Date(),
          };
          addMessage(assistantMessage);

        } catch (error) {
          setError(error instanceof Error ? error.message : "An unknown error occurred");
          console.error("Error in sendMessage:", error);
        } finally {
          setProcessing(false);
        }
      },
    }),
    { name: "admin-store" }
  )
); 