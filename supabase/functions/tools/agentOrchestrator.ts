import { summarizeTickets } from "./summarizeTickets.ts";
import { getUnassignedTickets } from "./getUnassignedTickets.ts";
import { updateTicket } from "./updateTicket.ts";
import { HumanMessage, SystemMessage } from "npm:langchain@0.1.21/schema";
import { categorizeTicket } from "./categorizeTicket.ts";
import { withLangSmithTracing } from "../_shared/langsmith.ts";
import { chatModel } from "../_shared/models.ts";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface AdminAgentResponse {
  reply: string;
  error?: string;
}

// Define the base function first
async function handleRequest(
  conversationHistory: Message[],
  newUserMessage: string
): Promise<AdminAgentResponse> {
  console.log('Starting agent request with message:', newUserMessage);
  
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

    console.log('Calling ChatModel with messages');
    // Get AI's interpretation of the request
    const response = await chatModel.call(messages);
    console.log('ChatModel response:', response);
    
    // Basic intent handling - we'll expand this
    const userIntent = newUserMessage.toLowerCase();
    
    if (userIntent.includes("unassigned tickets")) {
      console.log('Processing unassigned tickets request');
      const tickets = await getUnassignedTickets();
      if (tickets.length === 0) {
        console.log('No unassigned tickets found');
        return {
          reply: "There are no unassigned tickets at the moment."
        };
      }
      
      console.log('Generating summary for tickets');
      const summary = await summarizeTickets(tickets, chatModel);
      return {
        reply: summary
      };
    }

    // For now, return the AI's direct response
    console.log('Using direct AI response');
    return {
      reply: response.content
    };
  } catch (error) {
    console.error("Error in handleRequest:", error);
    return {
      reply: "I apologize, but I encountered an error processing your request.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Create the wrapped version with proper tracing
export const handleAdminAgentRequest = withLangSmithTracing(
  "admin_agent_request",
  handleRequest
); 