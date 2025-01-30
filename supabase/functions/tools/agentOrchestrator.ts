import { ChatOpenAI } from "npm:@langchain/openai@0.0.14";
import { AgentExecutor, OpenAIFunctionsAgent } from "npm:langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "npm:langchain/prompts";
import { RunnableSequence } from "npm:langchain/schema/runnable";
import { BaseMessage } from "npm:langchain/schema";
import { summarizeTickets } from "./summarizeTickets.ts";
import { getUnassignedTickets } from "./getUnassignedTickets.ts";
import { updateTicket } from "./updateTicket.ts";
import { categorizeTicket } from "./categorizeTicket.ts";
import { ticketQA, findTicketSolutions, analyzeTicketPatterns } from "./ticketQA.ts";
import { extractDocumentInfo, findRelevantDocs, generateDocumentSummary, suggestDocumentUpdates } from "./documentUtils.ts";
import { searchTickets, findRelated, searchByTopic } from "./semanticSearch.ts";
import { withLangSmithTracing } from "../_shared/langsmith.ts";
import { chatModel } from "../_shared/models.ts";
import type { Database } from "../_shared/database.types.ts";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface AdminAgentResponse {
  reply: string;
  error?: string;
}

// Define our tools in the format expected by the agent
const tools = [
  {
    name: "getUnassignedTickets",
    description: "Get a list of all unassigned tickets in the system",
    parameters: {
      type: "object",
      properties: {},
      required: []
    },
    func: withLangSmithTracing("tool_getUnassignedTickets", getUnassignedTickets)
  },
  {
    name: "summarizeTickets",
    description: "Generate a summary of the provided tickets",
    parameters: {
      type: "object",
      properties: {
        tickets: {
          type: "array",
          items: {
            type: "object",
            description: "Ticket objects to summarize"
          }
        }
      },
      required: ["tickets"]
    },
    func: withLangSmithTracing("tool_summarizeTickets", summarizeTickets)
  },
  {
    name: "categorizeTicket",
    description: "Analyze and categorize a ticket into the appropriate category",
    parameters: {
      type: "object",
      properties: {
        ticket: {
          type: "object",
          description: "The ticket to categorize"
        }
      },
      required: ["ticket"]
    },
    func: withLangSmithTracing("tool_categorizeTicket", categorizeTicket)
  },
  {
    name: "updateTicket",
    description: "Update a ticket's properties (status, assignment, etc.)",
    parameters: {
      type: "object",
      properties: {
        ticketId: { type: "string" },
        updates: {
          type: "object",
          description: "The properties to update on the ticket"
        }
      },
      required: ["ticketId", "updates"]
    },
    func: withLangSmithTracing("tool_updateTicket", updateTicket)
  },
  {
    name: "ticketQA",
    description: "Answer questions about tickets using context from similar tickets",
    parameters: {
      type: "object",
      properties: {
        question: { type: "string" }
      },
      required: ["question"]
    },
    func: withLangSmithTracing("tool_ticketQA", ticketQA)
  },
  {
    name: "findTicketSolutions",
    description: "Find potential solutions for a ticket based on similar past tickets",
    parameters: {
      type: "object",
      properties: {
        ticket: {
          type: "object",
          properties: {
            subject: { type: "string" },
            description: { type: "string", optional: true }
          }
        }
      },
      required: ["ticket"]
    },
    func: withLangSmithTracing("tool_findTicketSolutions", findTicketSolutions)
  },
  {
    name: "analyzeTicketPatterns",
    description: "Analyze patterns in tickets over a specific timeframe",
    parameters: {
      type: "object",
      properties: {
        timeframe: {
          type: "string",
          enum: ["day", "week", "month"]
        }
      },
      required: ["timeframe"]
    },
    func: withLangSmithTracing("tool_analyzeTicketPatterns", analyzeTicketPatterns)
  },
  {
    name: "searchTickets",
    description: "Semantically search through tickets",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        options: {
          type: "object",
          properties: {
            threshold: { type: "number", optional: true },
            limit: { type: "number", optional: true },
            includeMessages: { type: "boolean", optional: true }
          },
          optional: true
        }
      },
      required: ["query"]
    },
    func: withLangSmithTracing("tool_searchTickets", searchTickets)
  },
  {
    name: "findRelatedTickets",
    description: "Find tickets related to a specific ticket",
    parameters: {
      type: "object",
      properties: {
        ticketId: { type: "string" }
      },
      required: ["ticketId"]
    },
    func: withLangSmithTracing("tool_findRelatedTickets", findRelated)
  },
  {
    name: "searchByTopic",
    description: "Search tickets by a specific topic",
    parameters: {
      type: "object",
      properties: {
        topic: { type: "string" }
      },
      required: ["topic"]
    },
    func: withLangSmithTracing("tool_searchByTopic", searchByTopic)
  },
  {
    name: "findRelevantDocs",
    description: "Find relevant documentation for a ticket",
    parameters: {
      type: "object",
      properties: {
        ticket: {
          type: "object",
          properties: {
            subject: { type: "string" },
            description: { type: "string", optional: true },
            category: { type: "string", optional: true }
          }
        }
      },
      required: ["ticket"]
    },
    func: withLangSmithTracing("tool_findRelevantDocs", findRelevantDocs)
  },
  {
    name: "generateDocumentSummary",
    description: "Generate a summary of multiple documents",
    parameters: {
      type: "object",
      properties: {
        documents: {
          type: "array",
          items: {
            type: "object",
            properties: {
              content: { type: "string" },
              metadata: { type: "object" }
            }
          }
        }
      },
      required: ["documents"]
    },
    func: withLangSmithTracing("tool_generateDocumentSummary", generateDocumentSummary)
  }
];

// Create the prompt template
const prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are an AI admin assistant for a ticketing system. Your role is to help manage and organize support tickets.

Available Actions:
1. Ticket Management:
   - View and summarize unassigned tickets
   - Categorize tickets
   - Update ticket assignments and status
   - Search for tickets by content or topic

2. Ticket Analysis:
   - Answer questions about tickets
   - Find solutions for tickets
   - Analyze ticket patterns
   - Find related tickets

3. Documentation:
   - Find relevant documentation
   - Generate document summaries
   - Extract key information
   - Suggest document updates

Guidelines:
- Always be professional and clear in your responses
- When dealing with tickets, include relevant IDs and details
- If you need to update a ticket, confirm the action first
- If you're unsure about a request, ask for clarification
- Handle one request at a time thoroughly before moving to the next
- Use semantic search when looking for similar tickets or patterns
- Consider both ticket content and documentation when providing solutions

Categories for tickets are: billing, technical, account, feature_request, bug, security, other
Priorities are: urgent, high, normal, low
Statuses are: open, in_progress, pending, on_hold, solved, closed`],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

// Create the agent
const agent = OpenAIFunctionsAgent.fromLLMAndTools(chatModel, tools, {
  prompt,
});

// Create the executor
const executor = AgentExecutor.fromAgentAndTools({
  agent,
  tools,
  verbose: true,
  maxIterations: 3,
});

// Base function implementation
async function handleRequest(
  conversationHistory: Message[],
  newUserMessage: string
): Promise<AdminAgentResponse> {
  try {
    // Convert conversation history to the format expected by the agent
    const formattedHistory = conversationHistory.map(msg => ({
      content: msg.content,
      role: msg.role,
    }));

    // Execute the agent
    const result = await executor.invoke({
      input: newUserMessage,
      chat_history: formattedHistory,
    });

    return {
      reply: result.output,
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