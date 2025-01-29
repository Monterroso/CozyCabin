import { summarizeTickets } from "./summarizeTickets.ts";
import { getUnassignedTickets } from "./getUnassignedTickets.ts";
import { updateTicket } from "./updateTicket.ts";
import { withAiLogging } from "./aiLogger.ts";
import { ChatOpenAI } from "https://esm.sh/langchain@0.0.197/chat_models/openai";
import { HumanMessage, SystemMessage } from "https://esm.sh/langchain@0.0.197/schema";
import { categorizeTicket } from "./categorizeTicket.ts";
import { Client } from "npm:langsmith";

// Initialize LangSmith client
const client = new Client({
  apiKey: Deno.env.get("LANGSMITH_API_KEY"),
});

// Initialize the ChatOpenAI model with LangSmith tracing
const chatModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
  temperature: 0.7,
  modelName: "gpt-4-1106-preview",
  callbacks: [{
    handleLLMEnd: async (output) => {
      await client.createRun({
        name: "chat_completion",
        run_type: "llm",
        inputs: output.prompts,
        outputs: { response: output.response },
        extra: { model: "gpt-4-1106-preview" }
      });
    }
  }],
});

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface AdminAgentResponse {
  reply: string;
  error?: string;
}

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
      const summary = await summarizeTickets(tickets);
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
    throw error;
  }
}

// Export the handler with just AI logging since LangSmith is handled at the model level
export const handleAdminAgentRequest = withAiLogging(
  "admin_agent_request",
  handleRequest
); 