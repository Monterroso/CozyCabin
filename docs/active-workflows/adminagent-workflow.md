# Admin Agent Checklist

# Important Architecture Guidelines
Before proceeding with implementation, adhere to these critical guidelines to prevent code duplication:

1. **Reuse Existing Types**: 
   - All ticket-related types should be imported from `src/lib/types/ticket.ts`
   - All Supabase types should be imported from `src/lib/types/supabase.ts`
   - Never recreate types that exist elsewhere

2. **Shared Business Logic**:
   - All ticket-related operations should use the existing `ticketStore` from `src/stores/ticketStore.ts`
   - Do not recreate ticket CRUD operations that already exist in the store
   - Extend the existing store if new functionality is needed

3. **Component Reuse**:
   - Reuse existing components from `src/components/tickets/*`
   - Particularly for ticket display, forms, and filters
   - If a component needs modification, extend it rather than duplicate

4. **API Layer Consistency**:
   - All Supabase interactions should follow existing patterns
   - Use the established Supabase client configuration
   - Don't create new database access patterns if similar ones exist

5. **State Management**:
   - Continue using Zustand for state management
   - Integrate new features into existing stores where appropriate
   - Avoid creating parallel state management solutions

# Tech Stack Implementation Guidelines

1. **UI Components & Styling**:
   - Use Shadcn components as base building blocks
   - Follow MountainLodge theme colors from `src/theme/colors.ts`
   - Maintain Tailwind utility-first approach
   - Keep animations subtle and performant (150-300ms transitions)
   - Ensure WCAG AA compliance for all UI elements

2. **Form Handling**:
   - Use React Hook Form + Zod for all form validations
   - Import existing Zod schemas from `src/lib/schemas/`
   - Leverage Shadcn form components for consistency

3. **State Management Rules**:
   - Create or extend Zustand stores for AI-related state
   - Keep real-time subscriptions in dedicated hooks
   - Clean up subscriptions properly on unmount

4. **File Structure**:
   - Place Edge Functions in `supabase/functions/`
   - Keep components under 250 lines
   - Add JSDoc/TSDoc comments for all exports
   - Follow established folder structure

5. **Testing Requirements**:
   - Write Jest tests for critical paths
   - Implement error boundaries for AI components
   - Use Sentry for production error tracking

Below is a step-by-step checklist of tasks to implement your free-flowing Admin AI system using:

• Supabase (with pgvector)  
• LangChain (and LangSmith for observability)  
• File splitting/chunking when necessary (for document retrieval or summarization)  

To keep each step manageable, each checklist item refers to edits in exactly one file. If a step needs more than one file change, it is split into substeps.

---

## 1. Create a "CHECKLIST.md" (This File)
1. [X] In your project root, create a new file named CHECKLIST.md (this file).  
   - Purpose: Track the tasks needed for your Admin AI system.  
   - State: No code change yet, just documentation.

---

## 2. Create "supabase/functions/adminAgent/index.ts"
1. [X] Navigate to supabase/functions/adminAgent/ and create an index.ts file (if it does not already exist).
2. [X] Inside index.ts, set up the basic handle for receiving requests in Deno.  
   - Example:
     ```ts:supabase/functions/adminAgent/index.ts
     import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
     import { handleAdminAgentRequest } from "../../tools/agentOrchestrator.ts";

     serve(async (req: Request) => {
       try {
         const { messages, newUserMessage } = await req.json();
         const reply = await handleAdminAgentRequest(messages, newUserMessage);
         return new Response(JSON.stringify({ reply }), {
           headers: { "Content-Type": "application/json" },
         });
       } catch (error) {
         console.error("Error in adminAgent function:", error);
         return new Response("Server Error", { status: 500 });
       }
     });
     ```
   - Purpose: This is your Supabase Edge Function entry point.  
   - State: A new serverless function that can handle the admin's requests for ticket summarization, categorization, assignment, etc.

---

## 3. Create "supabase/functions/_shared/database.types.ts"
1. [X] Create shared types file with proper database schema types.
2. [X] Import and set up all necessary types from our main application.
3. [X] Ensure all enums and relationships are properly typed.
   - Purpose: Maintain type safety between Edge Function and main application.
   - State: Complete type definitions matching our Supabase schema.

---

## 4. Create "supabase/functions/tools/agentOrchestrator.ts"
1. [X] In supabase/functions/tools/, create a file named agentOrchestrator.ts.  
2. [X] Put high-level orchestration logic here (using LangChain or any direct LLM calls). For example:
   ```ts:supabase/functions/tools/agentOrchestrator.ts
   import { getUnassignedTickets } from "./getUnassignedTickets.ts";
   import { summarizeTickets } from "./summarizeTickets.ts";
   import { categorizeTicket } from "./categorizeTicket.ts";
   import { updateTicket } from "./updateTicket.ts";
   // import { useLangSmith } from "./langsmithIntegration.ts"; // if you want logging
   // import { chunkFileAndStore } from "./fileChunking.ts";

   export async function handleAdminAgentRequest(
     conversationHistory: { role: string; content: string }[],
     newUserMessage: string
   ): Promise<string> {
     // 1. Use an LLM or simple string parsing to interpret newUserMessage
     // 2. Based on user intent, call relevant tools (fetch tickets, summarize, categorize, etc.)
     // 3. Return a single string as the "assistant" response
     // For advanced usage, integrate LangChain Agents, Tools, and possibly a single ChatCompletion call.

     if (newUserMessage.toLowerCase().includes("unassigned tickets")) {
       const tickets = await getUnassignedTickets();
       if (tickets.length === 0) return "No unassigned tickets available.";
       const summary = await summarizeTickets(tickets);
       return `Here are the unassigned tickets:\n\n${summary}`;
     }

     // ... Additional commands, e.g., "categorize ticket #123", etc.

     return "I'm not sure how to handle that yet. Please try a different query.";
   }
   ```
   - Purpose: Central "agent" logic. It decides which tool function to call for each user query.  
   - State: A single orchestration file to keep your function entry point simpler.

---

## 5. Create "supabase/functions/tools/getUnassignedTickets.ts"
1. [X] In supabase/functions/tools/, create a file named getUnassignedTickets.ts.
2. [X] Fetch tickets from Supabase with assigned_to = null, using the Deno-compatible Supabase client:
   ```ts:supabase/functions/tools/getUnassignedTickets.ts
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
   // Ensure to pull your environment variables from the Edge Function, not from .env directly

   // example supabase client initialization:
   const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
   const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // from your Edge Function config
   const supabase = createClient(supabaseUrl, supabaseKey);

   export async function getUnassignedTickets() {
     const { data, error } = await supabase
       .from("tickets")
       .select("*")
       .eq("assigned_to", null);

     if (error) {
       console.error("Error fetching unassigned tickets:", error);
       throw error;
     }

     return data || [];
   }
   ```
   - Purpose: Provide a Deno-friendly function for retrieving unassigned tickets.  
   - State: Returns an array of ticket rows. Doesn't alter your DB.

---

## 6. Create "supabase/functions/tools/summarizeTickets.ts"
1. [ ] In supabase/functions/tools/, create a file named summarizeTickets.ts.
2. [ ] Use LangChain to summarize an array of ticket data:
   ```ts:supabase/functions/tools/summarizeTickets.ts
   import { ChatOpenAI } from "langchain/chat_models/openai";
   import { HumanMessage, SystemMessage } from "langchain/schema";

   interface Ticket {
     id: string;
     subject: string;
     description?: string;
   }

   const chatModel = new ChatOpenAI({
     openAIApiKey: Deno.env.get("LANGCHAIN_OPENAI_API_KEY"), // or however you set it
     temperature: 0.5,
   });

   export async function summarizeTickets(tickets: Ticket[]): Promise<string> {
     if (tickets.length === 0) return "No tickets to summarize.";

     const ticketLines = tickets.map((t) => {
       return `• Ticket #${t.id}: ${t.subject} - ${t.description?.slice(0, 60) ?? ""}`;
     }).join("\n");

     const systemPrompt = new SystemMessage(
       "You are an expert summarizer. Be concise and factual."
     );
     const userMessage = new HumanMessage(`Summarize these tickets:\n${ticketLines}`);

     const response = await chatModel.call([systemPrompt, userMessage]);
     return response.text;
   }
   ```
   - Purpose: Provide a short text summary of multiple tickets using LangChain's ChatOpenAI model.  
   - State: No database changes. Returns a string summary.

---

## 7. Create "supabase/functions/tools/categorizeTicket.ts"
1. [X] In supabase/functions/tools/, create categorizeTicket.ts.
2. [X] Use LangChain or direct OpenAI calls to predict a category:
   ```ts:supabase/functions/tools/categorizeTicket.ts
   import { ChatOpenAI } from "langchain/chat_models/openai";
   import { SystemMessage, HumanMessage } from "langchain/schema";

   interface Ticket { id: string; subject: string; description?: string; }

   const chatModel = new ChatOpenAI({
     openAIApiKey: Deno.env.get("LANGCHAIN_OPENAI_API_KEY"),
     temperature: 0.0,
   });

   export async function categorizeTicket(ticket: Ticket): Promise<string> {
     const systemPrompt = new SystemMessage(
       "You are a classification assistant that maps tickets to one of [Billing, Technical, Account, Other]."
     );
     const userMsg = new HumanMessage(`Subject: ${ticket.subject}\nDescription: ${ticket.description}\n\nWhich category?`);

     const response = await chatModel.call([systemPrompt, userMsg]);
     return response.text.trim();
   }
   ```
   - Purpose: Return a category string for the given ticket.  
   - State: No DB changes. Just classification logic.

---

## 8. Create "supabase/functions/tools/updateTicket.ts"
1. [X] In supabase/functions/tools/, create a file named updateTicket.ts.
2. [X] This function updates the "tickets" table to set new tags, assigned_to, or other fields:
   ```ts:supabase/functions/tools/updateTicket.ts
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

   const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
   const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
   const supabase = createClient(supabaseUrl, supabaseKey);

   interface TicketUpdate {
     tags?: string[];
     assigned_to?: string | null;
   }

   export async function updateTicket(ticketId: string, updates: TicketUpdate) {
     const { error } = await supabase
       .from("tickets")
       .update(updates)
       .eq("id", ticketId);

     if (error) {
       console.error(`Failed to update ticket ${ticketId}:`, error);
       throw error;
     }
     return true;
   }
   ```
   - Purpose: Apply changes to the ticket in the database.  
   - State:Ticket row is updated in Supabase if successful.

---

## 9. (Optional) Create "supabase/functions/tools/insertAiLogRecord.ts"
1. [ ] In supabase/functions/tools/, make a file named insertAiLogRecord.ts if you want to track metrics in an "ai_logs" table.
2. [ ] Insert a record whenever you do an AI action:
   ```ts:supabase/functions/tools/insertAiLogRecord.ts
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

   const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
   const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
   const supabase = createClient(supabaseUrl, supabaseKey);

   export async function insertAiLogRecord(params: {
     feature_name: string;
     success: boolean;
     error_type?: string;
     response_time_ms?: number;
   }) {
     const { error } = await supabase
       .from("ai_logs")
       .insert([params]);

     if (error) {
       console.error("Failed to insert AI log record:", error);
     }
   }
   ```
   - Purpose: Keep track of usage, success/fail events, or timing data in "ai_logs."  
   - State: Each call inserts a row into the logging table.

---

## 10. Upgrade to Advanced Agent Pattern with Vector Stores
This is an architectural upgrade that enhances our basic implementation with more sophisticated query handling.

### Step 10a: Set up Vector Stores
1. [ ] Create vector stores for tickets and customer data:
   ```typescript
   const ticketVectorStore = new Chroma(
     "tickets",
     new OpenAIEmbeddings({
       openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
     })
   );
   ```

### Step 10b: Create Specialized QA Chains
1. [ ] Implement RetrievalQA chains for different data types:
   ```typescript
   const ticketQA = RetrievalQA.fromChainType({
     llm: chatModel,
     chainType: "stuff",
     retriever: ticketVectorStore.asRetriever(),
   });
   ```

### Step 10c: Define Tool-based Architecture
1. [ ] Convert existing functions into LangChain tools:
   ```typescript
   const tools = [
     new Tool({
       name: "Ticket Query System",
       func: ticketQA.run,
       description: "Use when you need to answer questions about tickets...",
     }),
     // ... other tools
   ];
   ```

### Step 10d: Update Agent Orchestrator
1. [ ] Modify agentOrchestrator.ts to use the tool-based approach:
   ```typescript
   const agent = initializeAgent(
     tools,
     chatModel,
     {
       agentType: AgentType.ZERO_SHOT_REACT_DESCRIPTION,
       verbose: true
     }
   );
   ```

## 11. Implement Vector Storage (If Needed for Documents)
Sometimes you want the agent to read large documents or knowledge base to answer ticket-related queries.

### Step 11a: Create "supabase/functions/tools/setupPgVector.ts" (One-file edit)
1. [ ] Make a function to help with pgvector indexing or upserts. 
   ```ts:supabase/functions/tools/setupPgVector.ts
   // Pseudocode for how you might initialize a table with a "vector" column
   // In practice, you'd do a migration or run raw SQL.
   // Make sure your supabase is enabled with the pgvector extension.
   ```
   - Purpose: Provide any custom logic for vector-based searching or storing embeddings.  
   - State: This step might also involve a Supabase migration so your "embedding" column is a vector type.

### Step 11b: Create "supabase/functions/tools/fileChunking.ts" (One-file edit)
1. [ ] Implement a function that splits large files or text into smaller chunks, then stores embeddings in your "pgvector" table:
   ```ts:supabase/functions/tools/fileChunking.ts
   import { OpenAIEmbeddings } from "langchain/embeddings/openai";

   export async function chunkFileAndStoreFileEmbeddings(file: File) {
     // 1. Convert File -> text
     // 2. Split text into chunks
     // 3. Generate embeddings with LangChain's OpenAIEmbeddings
     // 4. Store vectors in your "documents" table with a vector column
   }
   ```
   - Purpose: Let the agent or system read from a large doc. If you plan to let the agent reference knowledge base content, these embeddings can help do similarity searches.  
   - State: No immediate changes to your tickets. This is for your knowledge base.

---

## 12. Create a Minimal Front-End to Call the Edge Function
### Step 12a: "src/pages/admin/AdminConsole.tsx"
1. [ ] Create the admin console page using our established component architecture:
   ```tsx:src/pages/admin/AdminConsole.tsx
   import { useState } from "react";
   import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
   import { Button } from "@/components/ui/button";
   import { Input } from "@/components/ui/input";
   import { ScrollArea } from "@/components/ui/scroll-area";
   import { useTicketStore } from "@/stores/ticketStore";
   import { useForm } from "react-hook-form";
   import { zodResolver } from "@hookform/resolvers/zod";
   import { adminMessageSchema } from "@/lib/schemas/admin";
   import type { Message } from "@/lib/types/admin";

   export default function AdminConsole() {
     const [messages, setMessages] = useState<Message[]>([]);
     const { handleSubmit, register, reset } = useForm({
       resolver: zodResolver(adminMessageSchema)
     });

     return (
       <Card className="w-full max-w-4xl mx-auto mt-6">
         <CardHeader>
           <CardTitle className="text-lodge-brown">Admin AI Console</CardTitle>
         </CardHeader>
         <CardContent>
           <ScrollArea className="h-[400px] border rounded-md p-4">
             {messages.map((m, i) => (
               <div key={i} className={`mb-4 ${m.role === 'assistant' ? 'bg-cabin-cream' : ''} p-3 rounded-lg`}>
                 <strong className="text-pine-green">{m.role}:</strong> {m.content}
               </div>
             ))}
           </ScrollArea>
           <form onSubmit={handleSubmit(async (data) => {
             // Form submission logic here
           })}>
             <div className="flex gap-2 mt-4">
               <Input
                 {...register('content')}
                 placeholder="Ask the agent something..."
                 className="flex-1"
               />
               <Button type="submit" className="bg-lodge-brown hover:bg-lodge-brown/90">
                 Send
               </Button>
             </div>
           </form>
         </CardContent>
       </Card>
     );
   }
   ```
   - Purpose: Provide a modern, accessible UI using our design system.
   - State: Uses Shadcn components, MountainLodge theme, and proper form handling.

### Step 12b: "src/stores/adminStore.ts"
1. [ ] Create a Zustand store for admin AI state management:
   ```ts:src/stores/adminStore.ts
   import { create } from 'zustand';
   import { devtools } from 'zustand/middleware';
   import type { Message } from '@/lib/types/admin';
   
   interface AdminStore {
     messages: Message[];
     isProcessing: boolean;
     addMessage: (message: Message) => void;
     clearMessages: () => void;
     setProcessing: (status: boolean) => void;
   }

   export const useAdminStore = create<AdminStore>()(
     devtools(
       (set) => ({
         messages: [],
         isProcessing: false,
         addMessage: (message) => 
           set((state) => ({ messages: [...state.messages, message] })),
         clearMessages: () => set({ messages: [] }),
         setProcessing: (status) => set({ isProcessing: status }),
       }),
       { name: 'admin-store' }
     )
   );
   ```
   - Purpose: Centralize admin AI state management using Zustand.
   - State: Maintains chat history and processing states.

---

## Types and Schemas Setup

### Step 1a: "src/lib/types/admin.ts"
1. [ ] Create type definitions for admin-related structures:
   ```ts:src/lib/types/admin.ts
   import { z } from 'zod';
   import type { Database } from './supabase';

   export type Message = {
     role: 'user' | 'assistant';
     content: string;
     timestamp: Date;
   };

   export type AdminAgentState = {
     currentSession: string | null;
     lastUpdate: Date | null;
     activeFilters: string[];
   };

   // Type-safe database references
   export type TicketRow = Database['public']['Tables']['tickets']['Row'];
   export type AgentRow = Database['public']['Tables']['agents']['Row'];
   ```

### Step 1b: "src/lib/schemas/admin.ts"
1. [ ] Define Zod schemas for validation:
   ```ts:src/lib/schemas/admin.ts
   import { z } from 'zod';

   export const adminMessageSchema = z.object({
     content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
   });

   export const adminFilterSchema = z.object({
     dateRange: z.object({
       start: z.date().optional(),
       end: z.date().optional(),
     }),
     status: z.enum(['open', 'closed', 'in_progress']).optional(),
     priority: z.enum(['low', 'medium', 'high']).optional(),
   });

   export type AdminMessageInput = z.infer<typeof adminMessageSchema>;
   export type AdminFilterInput = z.infer<typeof adminFilterSchema>;
   ```

## Advanced Agent Pattern with Vector Stores

This section outlines an advanced implementation pattern that combines agents with vector stores for more sophisticated query handling and information retrieval.

### Key Benefits
- Better separation of concerns through specialized tools
- Intelligent routing of queries to appropriate subsystems
- Multi-hop reasoning capabilities
- Enhanced search through vector embeddings
- More natural handling of complex queries

### Implementation Example
```typescript
import { RetrievalQA } from "langchain/chains";
import { Chroma } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Tool, AgentType, initializeAgent } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";

// 1. Set up vector stores for different data types
const ticketVectorStore = new Chroma(
  "tickets",
  new OpenAIEmbeddings({
    openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
  })
);

const customerVectorStore = new Chroma(
  "customers",
  new OpenAIEmbeddings({
    openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
  })
);

// 2. Create specialized QA chains
const ticketQA = RetrievalQA.fromChainType({
  llm: chatModel,
  chainType: "stuff",
  retriever: ticketVectorStore.asRetriever(),
});

const customerQA = RetrievalQA.fromChainType({
  llm: chatModel,
  chainType: "stuff",
  retriever: customerVectorStore.asRetriever(),
});

// 3. Define specialized tools
const tools = [
  new Tool({
    name: "Ticket Query System",
    func: ticketQA.run,
    description: "Use when you need to answer questions about tickets, their status, or history. Input should be a complete question.",
  }),
  new Tool({
    name: "Customer Information System",
    func: customerQA.run,
    description: "Use when you need information about customers, their history, or preferences. Input should be a complete question.",
  }),
  new Tool({
    name: "Ticket Update System",
    func: updateTicket,
    description: "Use when you need to modify ticket properties like status, assignment, or priority.",
  })
];

// 4. Initialize the agent with these tools
const agent = initializeAgent(
  tools,
  chatModel,
  {
    agentType: AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose: true
  }
);

// 5. Example usage in our orchestrator
export async function handleAdminAgentRequest(
  conversationHistory: Message[],
  newUserMessage: string
): Promise<string> {
  try {
    // The agent will automatically choose the right tool based on the query
    const response = await agent.run(newUserMessage);
    return response;
  } catch (error) {
    console.error("Error in handleAdminAgentRequest:", error);
    return "I encountered an error processing your request. Please try again.";
  }
}
```

### Integration Steps
1. First complete the basic tool implementation (Steps 1-8 above)
2. Add vector store setup for tickets and customer data
3. Create specialized QA chains for different query types
4. Modify the agent orchestrator to use the tool-based approach
5. Add multi-hop reasoning capabilities for complex queries

### Example Complex Queries This Can Handle
1. "Find all high-priority tickets from customers who have reported similar issues in the past month"
2. "Summarize the common themes in unassigned tickets and suggest assignments based on agent performance history"
3. "What's the average response time for tickets from our enterprise customers, and who are our best-performing agents for these tickets?"

This pattern is particularly useful when:
- You need to search through large amounts of ticket/customer history
- Queries require combining information from multiple sources
- You want the agent to make more intelligent routing decisions
- You need to handle complex, multi-step queries

## Final Notes
• Run "yarn supabase functions deploy adminAgent" to deploy your Edge Function with all these files included.  
• Confirm your environment variables are set in the Supabase dashboard for Deno runtime (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LangChain keys, etc.).  
• With each step completed, your "tools" can be orchestrated by the agent. You have the option to add pgvector embeddings, file chunking, and LangSmith for advanced logging or chain visualization.  

By following these checklist items in order, you keep each step confined to editing a single file or a single set of small substeps, making it easier to manage in your codebase.