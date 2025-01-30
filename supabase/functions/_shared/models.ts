import { ChatOpenAI } from "npm:@langchain/openai@0.0.14";
import { tracer } from "./langsmith.ts";

// Initialize base ChatOpenAI instance with tracer
const baseChatModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
  temperature: 0.7,
  modelName: "gpt-4-1106-preview",
  verbose: true,
  callbacks: [tracer], // The tracer will handle LangSmith logging
});

// Export the chat model directly - no need for additional wrapping
export const chatModel = baseChatModel; 