import { getUnassignedTickets } from "./getUnassignedTickets.ts";
import { summarizeTickets } from "./summarizeTickets.ts";
import { categorizeTicket } from "./categorizeTicket.ts";
import { updateTicket } from "./updateTicket.ts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { withAiLogging } from "./aiLogger";

// Initialize the ChatOpenAI model
const chatModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
  temperature: 0.7,
  modelName: "gpt-4-1106-preview"
});

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const baseHandleAdminAgentRequest = async (
  conversationHistory: Message[],
  newUserMessage: string
): Promise<string> => {
  try {
    // Create system message for context
    const systemMessage = new SystemMessage(
      `You are an AI admin assistant for a ticketing system. You can:
      1. View unassigned tickets
      2. Summarize tickets
      3. Categorize tickets
      4. Update ticket assignments
      
      Respond naturally but professionally. If you're unsure about a request, ask for clarification.`
    );

    // Add the new user message to conversation history
    const messages = [
      systemMessage,
      ...conversationHistory.map(msg => 
        msg.role === "user" ? new HumanMessage(msg.content) : new SystemMessage(msg.content)
      ),
      new HumanMessage(newUserMessage)
    ];

    // Get AI's interpretation of the request
    const response = await chatModel.call(messages);
    
    // Basic intent handling - we'll expand this
    const userIntent = newUserMessage.toLowerCase();
    
    if (userIntent.includes("unassigned tickets")) {
      const tickets = await getUnassignedTickets();
      if (tickets.length === 0) return "There are no unassigned tickets at the moment.";
      
      const summary = await summarizeTickets(tickets);
      return summary;
    }

    // For now, return the AI's direct response
    return response.content;

  } catch (error) {
    console.error("Error in handleAdminAgentRequest:", error);
    return "I encountered an error processing your request. Please try again or rephrase your question.";
  }
};

// Wrap the base function with logging
export const handleAdminAgentRequest = withAiLogging(
  "admin_agent_request",
  baseHandleAdminAgentRequest
); 