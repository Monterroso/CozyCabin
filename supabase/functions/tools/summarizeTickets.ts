import { HumanMessage, SystemMessage } from "https://esm.sh/langchain@0.0.197/schema";
import type { Database } from "../_shared/database.types.ts";
import { chatModel } from "../_shared/models.ts";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  profiles?: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

export async function summarizeTickets(tickets: Ticket[]): Promise<string> {
  if (tickets.length === 0) return "No tickets to summarize.";

  // Format tickets with all relevant information
  const ticketLines = tickets.map((t) => {
    const customerInfo = t.profiles ? `Customer: ${t.profiles.full_name} (${t.profiles.email})` : "No customer info";
    return `
• Ticket ID: ${t.id}
  Subject: ${t.subject}
  Description: ${t.description?.slice(0, 150)}${t.description && t.description.length > 150 ? "..." : ""}
  Priority: ${t.priority}
  Status: ${t.status}
  Category: ${t.category || 'Uncategorized'}
  ${customerInfo}
  Created: ${new Date(t.created_at).toLocaleString()}`;
  }).join("\n");

  const systemPrompt = new SystemMessage(
    `You are an expert help desk manager summarizing tickets. For the given tickets:
    1. Group them by priority if there are multiple priorities
    2. Identify common themes or patterns
    3. Highlight any urgent or critical issues
    4. Be concise but include key details
    5. Format the summary in a clear, structured way
    6. Include the ticket IDs in your reference`
  );

  const userMessage = new HumanMessage(
    `Please summarize the following tickets:\n${ticketLines}`
  );

  try {
    const response = await chatModel.call([systemPrompt, userMessage]);
    return response.content;
  } catch (error) {
    console.error("Error in summarizeTickets:", error);
    return `Error generating summary: ${error.message}. Raw ticket count: ${tickets.length}`;
  }
} 