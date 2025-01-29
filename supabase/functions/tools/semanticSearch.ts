import { vectorStore } from "./vectorStore";
import { withAiLogging } from "./aiLogger";
import type { Database } from "../_shared/database.types";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"];
type TicketComment = Database["public"]["Tables"]["ticket_comments"]["Row"];

interface SearchOptions {
  threshold?: number;
  limit?: number;
  status?: Ticket["status"][];
  priority?: Ticket["priority"][];
  category?: Ticket["category"][];
  includeMessages?: boolean;
}

// Base function for semantic ticket search
const baseSearchTickets = async (
  query: string,
  options: SearchOptions = {}
) => {
  const {
    threshold = 0.78,
    limit = 5,
    status,
    priority,
    category,
    includeMessages = false
  } = options;

  try {
    // Search tickets
    const ticketResults = await vectorStore.similaritySearch(query, limit, {
      match_threshold: threshold,
      filter: {
        ...(status && { status: { in: status } }),
        ...(priority && { priority: { in: priority } }),
        ...(category && { category: { in: category } })
      }
    });

    const tickets = ticketResults.map(doc => ({
      ticket: doc.metadata as Ticket,
      similarity: doc.metadata.similarity as number
    }));

    // Search messages if requested
    if (includeMessages) {
      const vector = await vectorStore.embeddings.embedQuery(query);
      
      const { data: messages, error } = await vectorStore.supabase
        .rpc("match_messages", {
          query_embedding: vector,
          match_threshold: threshold,
          match_count: limit
        });

      if (error) throw error;

      return {
        tickets,
        messages: messages.map(msg => ({
          message: msg as TicketComment,
          similarity: msg.similarity as number
        }))
      };
    }

    return { tickets, messages: [] };
  } catch (error) {
    console.error("Error in semantic search:", error);
    throw error;
  }
};

// Wrap with logging
export const searchTickets = withAiLogging(
  "semantic_search",
  baseSearchTickets
);

// Base function to find related tickets and messages
const baseFindRelated = async (
  ticketId: string,
  options: Omit<SearchOptions, "threshold"> = {}
) => {
  try {
    const { data: ticket, error } = await vectorStore.supabase
      .from("tickets")
      .select("subject, description")
      .eq("id", ticketId)
      .single();

    if (error) throw error;
    if (!ticket) throw new Error("Ticket not found");

    const query = `${ticket.subject}\n\n${ticket.description ?? ""}`;
    return await searchTickets(query, {
      threshold: 0.85, // Higher threshold for related content
      includeMessages: true, // Always include messages for related content
      ...options
    });
  } catch (error) {
    console.error("Error finding related content:", error);
    throw error;
  }
};

// Wrap with logging
export const findRelated = withAiLogging(
  "find_related",
  baseFindRelated
);

// Base function to search by topic
const baseSearchByTopic = async (
  topic: string,
  options: SearchOptions = {}
) => {
  const enhancedQuery = `Find content related to the topic: ${topic}`;
  return await searchTickets(enhancedQuery, {
    threshold: 0.75, // Lower threshold for topic search
    limit: 10, // More results for topics
    includeMessages: true, // Include messages in topic search
    ...options
  });
};

// Wrap with logging
export const searchByTopic = withAiLogging(
  "search_by_topic",
  baseSearchByTopic
); 
