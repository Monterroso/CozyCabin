import type { Database } from "./supabase";

export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type AdminAgentResponse = {
  reply: string;
  error?: string;
};

// Form data types
export type AdminMessageFormData = {
  content: string;
};

// API request types
export type AdminAgentRequest = {
  messages: Message[];
  newUserMessage: string;
};

// Store types
export interface AdminState {
  messages: Message[];
  isProcessing: boolean;
  error: string | null;
}

// Action types
export interface AdminActions {
  addMessage: (message: Message) => void;
  setProcessing: (status: boolean) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
}

export type AdminStore = AdminState & AdminActions; 