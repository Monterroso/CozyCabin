import { ChatOpenAI } from "https://esm.sh/langchain@0.0.197/chat_models/openai";
import { SystemMessage, HumanMessage } from "https://esm.sh/langchain@0.0.197/schema";
import type { Database } from "../_shared/database.types";
import { withAiLogging } from "./aiLogger.ts";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  profiles?: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

type TicketCategory = Database["public"]["Enums"]["ticket_category"];

const chatModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
  temperature: 0.0, // Use 0 for consistent categorization
  modelName: "gpt-4-1106-preview"
});

const baseCategorizeTicket = async (ticket: Ticket): Promise<{
  category: TicketCategory;
  confidence: number;
  reasoning: string;
}> => {
  try {
    const systemPrompt = new SystemMessage(
      `You are an expert ticket categorization system. Analyze the ticket and:
      1. Assign ONE category from this list: [billing, technical, account, feature_request, bug, security, other]
      2. Provide a confidence score (0-1)
      3. Explain your reasoning
      
      Respond in this JSON format:
      {
        "category": "category_name",
        "confidence": 0.95,
        "reasoning": "Brief explanation"
      }
      
      Guidelines:
      - "billing": Payment, subscription, or pricing issues
      - "technical": Code, API, or implementation problems
      - "account": Login, permissions, or user settings
      - "feature_request": New functionality requests
      - "bug": Existing functionality not working as expected
      - "security": Security concerns or vulnerabilities
      - "other": Doesn't fit other categories
      
      Consider both the subject and description for accurate categorization.`
    );

    const ticketContent = `
Subject: ${ticket.subject}
Description: ${ticket.description || "No description provided"}
Customer: ${ticket.profiles ? `${ticket.profiles.full_name} (${ticket.profiles.email})` : "No customer info"}
Priority: ${ticket.priority}
Status: ${ticket.status}
`;

    const userMessage = new HumanMessage(ticketContent);
    const response = await chatModel.call([systemPrompt, userMessage]);
    
    try {
      const result = JSON.parse(response.content);
      // Validate the category matches our enum
      if (!isValidTicketCategory(result.category)) {
        throw new Error(`Invalid category: ${result.category}`);
      }
      return {
        category: result.category as TicketCategory,
        confidence: result.confidence,
        reasoning: result.reasoning
      };
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return {
        category: "other" as TicketCategory,
        confidence: 0,
        reasoning: "Error processing categorization"
      };
    }
  } catch (error) {
    console.error("Error in categorizeTicket:", error);
    return {
      category: "other" as TicketCategory,
      confidence: 0,
      reasoning: `Error: ${error.message}`
    };
  }
};

// Type guard to validate the category
function isValidTicketCategory(category: string): category is TicketCategory {
  return ["billing", "technical", "account", "feature_request", "bug", "security", "other"].includes(category);
}

// Wrap the base function with logging
export const categorizeTicket = withAiLogging(
  "categorize_ticket",
  baseCategorizeTicket
); 