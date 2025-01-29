import { z } from "zod";

// Message schema
export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message cannot be empty").max(10000, "Message is too long"),
  timestamp: z.date(),
});

// Form validation schema
export const adminMessageFormSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message cannot exceed 1000 characters")
    .trim(),
});

// API request schema
export const adminAgentRequestSchema = z.object({
  messages: z.array(messageSchema),
  newUserMessage: z.string().min(1),
});

// API response schema
export const adminAgentResponseSchema = z.object({
  reply: z.string(),
  error: z.string().optional(),
});

// Types from schemas
export type Message = z.infer<typeof messageSchema>;
export type AdminMessageFormData = z.infer<typeof adminMessageFormSchema>;
export type AdminAgentRequest = z.infer<typeof adminAgentRequestSchema>;
export type AdminAgentResponse = z.infer<typeof adminAgentResponseSchema>; 