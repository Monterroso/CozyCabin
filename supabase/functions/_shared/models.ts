import { ChatOpenAI } from "npm:@langchain/openai@0.0.14";
import { tracer } from "./langsmith.ts";
import { withAiLogging } from "../tools/aiLogger.ts";

// Initialize base ChatOpenAI instance with tracer
const baseChatModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
  temperature: 0.7,
  modelName: "gpt-4-1106-preview",
  verbose: true,
  callbacks: [tracer], // The tracer will handle LangSmith logging
}); 
// Create a wrapped version that includes AI logging
const wrappedCall = withAiLogging(
  "chat_model",
  async (messages: any[]) => await baseChatModel.call(messages)
);

// Export a wrapped version of the chat model
export const chatModel = {
  ...baseChatModel,
  call: wrappedCall
}; 
