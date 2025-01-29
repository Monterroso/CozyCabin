# Admin Agent Checklist

This unified document merges all of the original instructions—including detailed subpoints—into a single reference for building an Admin AI system with Supabase, LangChain, pgvector, and optional advanced agent patterns. Redundant steps and repeated checklists have been removed or consolidated.

---

## Important Architecture Guidelines

Adhere to the following rules to prevent code duplication and maintain consistency:

1. **Reuse Existing Types**  
   - Import ticket-related types from "src/lib/types/ticket.ts".  
   - Import Supabase-related types from "src/lib/types/supabase.ts".  
   - Never recreate or redefine types that already exist elsewhere.

2. **Shared Business Logic**  
   - All ticket-related operations should use `ticketStore` from "src/stores/ticketStore.ts".  
   - If you need new functionality for tickets, extend `ticketStore` rather than duplicating logic.  
   - Avoid introducing ticket CRUD operations outside the core store.

3. **Component Reuse**  
   - Reuse existing components from "src/components/tickets/*".  
   - Especially for displaying tickets, forms, or filters.  
   - If a component needs to be modified, extend it rather than duplicating code.

4. **API Layer Consistency**  
   - All Supabase interactions should follow established patterns.  
   - Always use the centralized Supabase client configuration.  
   - Don't create new database functions or queries if a similar one already exists.

5. **State Management**  
   - Continue using Zustand for state management.  
   - Integrate new features into existing stores whenever possible.  
   - Avoid creating parallel or duplicate state solutions.

---

## Tech Stack Implementation Guidelines

1. **UI Components & Styling**  
   - Use Shadcn UI components as foundational building blocks.  
   - Respect MountainLodge theme colors from "src/theme/colors.ts".  
   - Maintain a Tailwind utility-first approach, with subtle animations (150-300ms).  
   - Enforce WCAG AA compliance on all UI elements.

2. **Form Handling**  
   - Use React Hook Form + Zod for form validations.  
   - Import existing Zod schemas from "src/lib/schemas/".  
   - Use Shadcn form components to ensure a consistent look and feel.

3. **State Management Rules**  
   - Create or extend Zustand stores for AI-related states.  
   - Keep real-time subscriptions in dedicated hooks.  
   - Properly clean up subscriptions on component unmount.

4. **File Structure**  
   - Place Edge Functions in "supabase/functions/".  
   - Keep components under 250 lines and well-documented.  
   - Follow the established folder structure and add JSDoc/TSDoc comments for all exports.

5. **Testing Requirements**  
   - Write Jest tests for critical paths.  
   - Use error boundaries for AI components.  
   - Track production errors with Sentry.

---

## Steps to Implement the Admin AI System

Below is the primary checklist for creating your Admin AI system. Each step typically involves edits to just one file (or small substeps if multiple files must be changed). Tasks that are already completed are marked accordingly.

---

### 1. Create a "CHECKLIST.md" (This File)

1. [x] In your project root, create a new file named CHECKLIST.md (this file).  
   - Purpose: Keeps track of tasks for the Admin AI system.  
   - State: No code changes, just documentation.

---

### 2. Create "supabase/functions/adminAgent/index.ts"

1. [x] Navigate to "supabase/functions/adminAgent/" and create an "index.ts" file (if it doesn't exist).  
2. [x] Set up a basic Deno-based HTTP handler to receive requests:  
   - Example:
     ```ts
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
   - Purpose: Edge Function entry point to handle admin AI requests, e.g. summarizing or categorizing tickets.

---

### 3. Create "supabase/functions/_shared/database.types.ts"

1. [x] Create a shared types file. Import your application's Supabase types from "src/lib/types/supabase.ts" (or wherever you keep them).  
2. [x] Ensure any enums or relationship types are properly mapped.  
3. [x] Provide a consistent way to share DB-related interfaces between Edge Functions and the main app.

---

### 4. Create "supabase/functions/tools/agentOrchestrator.ts"

1. [x] In "supabase/functions/tools/", create "agentOrchestrator.ts".  
2. [x] Add logic orchestrating different "tools" (helper methods) or direct calls to LangChain/LLMs. For example:
   ```ts
   import { getUnassignedTickets } from "./getUnassignedTickets.ts";
   import { summarizeTickets } from "./summarizeTickets.ts";
   import { categorizeTicket } from "./categorizeTicket.ts";
   import { updateTicket } from "./updateTicket.ts";

   export async function handleAdminAgentRequest(
     conversationHistory: { role: string; content: string }[],
     newUserMessage: string
   ): Promise<string> {
     // Example logic: parse newUserMessage, decide which tool to call, return a string response.
     if (newUserMessage.toLowerCase().includes("unassigned tickets")) {
       const tickets = await getUnassignedTickets();
       if (tickets.length === 0) return "No unassigned tickets available.";
       const summary = await summarizeTickets(tickets);
       return `Here are the unassigned tickets:\n\n${summary}`;
     }

     return "I'm not sure how to handle that yet. Please try a different query.";
   }
   ```
   - Purpose: Single entry point for orchestrating calls to multiple AI or DB tools.

---

### 5. Create "supabase/functions/tools/getUnassignedTickets.ts"

1. [x] In "supabase/functions/tools/", create "getUnassignedTickets.ts".  
2. [x] Use the Deno-compatible Supabase client to query tickets where `assigned_to` is null:
   ```ts
   import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

   const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
   const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
   - Purpose: Fetch unassigned tickets for further AI processing.

---

### 6. Create "supabase/functions/tools/summarizeTickets.ts"

1. [ ] In "supabase/functions/tools/", create "summarizeTickets.ts".  
2. [ ] Use LangChain's ChatOpenAI (or other model) to generate a concise summary of tickets:
   ```ts
   import { ChatOpenAI } from "langchain/chat_models/openai";
   import { HumanMessage, SystemMessage } from "langchain/schema";

   interface Ticket {
     id: string;
     subject: string;
     description?: string;
   }

   const chatModel = new ChatOpenAI({
     openAIApiKey: Deno.env.get("LANGCHAIN_OPENAI_API_KEY"),
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
     return response.text.trim();
   }
   ```
   - Purpose: Provide a short textual summary of multiple tickets.

---

### 7. Create "supabase/functions/tools/categorizeTicket.ts"

1. [x] In "supabase/functions/tools/", create "categorizeTicket.ts".  
2. [x] Classify a single ticket into a category:
   ```ts
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
     const userMsg = new HumanMessage(
       `Subject: ${ticket.subject}\nDescription: ${ticket.description}\n\nWhich category?`
     );

     const response = await chatModel.call([systemPrompt, userMsg]);
     return response.text.trim();
   }
   ```
   - Purpose: Quickly classify a ticket's category.

---

### 8. Create "supabase/functions/tools/updateTicket.ts"

1. [x] In "supabase/functions/tools/", create "updateTicket.ts".  
2. [x] Update ticket fields like tags or assignment in the DB:
   ```ts
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
   - Purpose: Write changes back to the "tickets" table.

---

### 9. AI Operation Logging (Completed)

1. [x] Created `ai_logs` table in the DB:  
   - Fields: `id`, `feature_name`, `success`, `error_type`, `response_time_ms`, `metadata`, `created_at`  
   - RLS policies to ensure only admins can view logs  
   - Indexes for typical queries (feature_name, success, created_at)

2. [x] Implemented `withAiLogging` Higher-Order Function:  
   - Automatically tracks execution time  
   - Records success/failure state  
   - Safely stringifies arguments and results  
   - Captures and logs errors

3. [x] Integrated Logging With AI Tools:  
   - "categorizeTicket.ts"  
   - "summarizeTickets.ts"  
   - "agentOrchestrator.ts"

---

### 10. Vector Storage Setup (Completed)

1. [x] Migration `013_setup_pgvector.sql`:  
   - Enabled pgvector extension  
   - Added a 1536-dimensional `embedding` column to the `tickets` table  
   - Created an IVFFlat index for similarity search  
   - Provided a `match_tickets` function  
   - Added row-level security policies for secure access

2. [x] Created `vectorStore.ts` Interface:  
   - Initialized a Supabase client with OpenAI embeddings  
   - Set up LangChain's `SupabaseVectorStore`  
   - Implemented `updateTicketEmbeddings` function  
   - Implemented `findSimilarTickets` function  
   - Added AI logging for vector operations

---

### 11. Message Vector Storage (Completed)

1. [x] Created migration `014_message_embeddings.sql`:  
   - Added an `embedding` column to `ticket_comments`  
   - Created a similarity search index  
   - Provided a `match_messages` function for searching messages  
   - Added a queue table and DB triggers for automatic embedding updates

2. [x] Implemented a Queue Processing System:  
   - Created a `processEmbeddingQueue.ts` for batch processing with retries  
   - Handled error capturing and logging  
   - Applied row-level security policies where appropriate  

---

## Potential Issues to Address

1. **Performance Considerations**  
   - Large embedding updates may need batching.  
   - The IVFFlat index might need tuning based on data size.  
   - Caching frequently accessed embeddings can help.

2. **Error Handling**  
   - Handle OpenAI API failures robustly.  
   - Retry on transient network or rate-limit errors.  
   - Provide user-friendly messages on failures.

3. **Security**  
   - Maintain RLS policies carefully, especially for AI logs and embeddings.  
   - Validate environment variable usage for keys.  
   - Monitor access patterns to ensure sensitive data is protected.

4. **Maintenance**  
   - Plan for index maintenance if your data grows large.  
   - Weigh the cost of storing embeddings vs. the benefit of vector search.  
   - Revisit or refine embedding logic periodically.

5. **Cost Management**  
   - Track OpenAI API usage for embeddings or classification calls.  
   - Cache or batch calls to reduce usage.  
   - Implement rate limiting or usage alerts if needed.

---

### 12. Create a Minimal Front-End to Call the Edge Function

This section outlines building a simple admin console UI so your admin users can interact with the AI-driven system.

#### 12a: "src/pages/admin/AdminConsole.tsx"

1. [ ] Create an Admin Console page using existing design patterns (Shadcn, Tailwind, etc.):  
   ```tsx
   import { useState } from "react";
   import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
   import { Button } from "@/components/ui/button";
   import { Input } from "@/components/ui/input";
   import { ScrollArea } from "@/components/ui/scroll-area";
   import { useForm } from "react-hook-form";
   import { zodResolver } from "@hookform/resolvers/zod";
   import { adminMessageSchema } from "@/lib/schemas/admin";
   import type { Message } from "@/lib/types/admin";

   export default function AdminConsole() {
     const [messages, setMessages] = useState<Message[]>([]);
     const { handleSubmit, register, reset } = useForm({
       resolver: zodResolver(adminMessageSchema),
     });

     return (
       <Card className="w-full max-w-4xl mx-auto mt-6">
         <CardHeader>
           <CardTitle>Admin AI Console</CardTitle>
         </CardHeader>
         <CardContent>
           <ScrollArea className="h-[400px] border rounded-md p-4">
             {messages.map((m, i) => (
               <div key={i} className={`mb-4 ${m.role === "assistant" ? "bg-gray-50" : ""} p-3 rounded-lg`}>
                 <strong>{m.role}:</strong> {m.content}
               </div>
             ))}
           </ScrollArea>
           <form
             onSubmit={handleSubmit(async (data) => {
               // Submit form logic: call adminAgent function, update messages
             })}
           >
             <div className="flex gap-2 mt-4">
               <Input
                 {...register("content")}
                 placeholder="Ask the agent something..."
                 className="flex-1"
               />
               <Button type="submit">
                 Send
               </Button>
             </div>
           </form>
         </CardContent>
       </Card>
     );
   }
   ```
   - Purpose: Provide a user-friendly console for admin interactions with the AI.

#### 12b: "src/stores/adminStore.ts"

1. [ ] Create or extend a Zustand store to hold admin AI state:  
   ```ts
   import { create } from "zustand";
   import { devtools } from "zustand/middleware";
   import type { Message } from "@/lib/types/admin";

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
       { name: "admin-store" }
     )
   );
   ```
   - Purpose: Centralize AI conversation state.  
   - State: Maintains the chat history, whether the agent is "thinking," etc.

---

## Types and Schemas Setup

When working with admin-level data or interactive forms, you'll likely have dedicated types and Zod schemas.

### Step 1a: "src/lib/types/admin.ts"

1. [ ] Create `Message`, `AdminAgentState`, and other admin-related types.  
2. [ ] Reference your existing Supabase `Database` schema if needed, e.g. `Database["public"]["Tables"]["tickets"]["Row"]`.

### Step 1b: "src/lib/schemas/admin.ts"

1. [ ] Define your Zod schemas for admin interactions, e.g.:
   ```ts
   import { z } from "zod";

   export const adminMessageSchema = z.object({
     content: z.string().min(1, "Message cannot be empty").max(1000),
   });
   ```
2. [ ] Use these schemas to validate form input in your admin console.

---

## 11 (Alternate). Implement Vector Storage (If Needed for Documents)

If you'd like the agent to reference large documents or knowledge bases, you can extend the approach with file chunking and storing embeddings in Supabase:

1. [x] Created or updated pgvector migrations for storing embeddings.  
2. [x] Provided a "fileChunking.ts" (optional) that splits large files into chunks, then stores chunk embeddings in a `documents` table with a vector column.  
3. [x] Integrated chunk retrieval with retrieval QA in LangChain.

---

## Advanced Agent Pattern with Vector Stores

In more sophisticated setups, you can combine multiple Tools, vector stores, or multi-hop reasoning. For instance:

1. **Key Benefits**  
   - Better separation of concerns: each tool addresses a different need.  
   - Intelligent routing: the agent decides which tool best fits the query.  
   - Enhanced search via vector embeddings.  
   - Multi-step reasoning for complex queries.

2. **Implementation Example**  
   ```ts
   import { RetrievalQA } from "langchain/chains";
   import { Chroma } from "langchain/vectorstores";
   import { OpenAIEmbeddings } from "langchain/embeddings/openai";
   import { Tool, AgentType, initializeAgent } from "langchain/agents";
   import { ChatOpenAI } from "langchain/chat_models/openai";

   // Example vector store for tickets
   const ticketVectorStore = new Chroma(
     "tickets",
     new OpenAIEmbeddings({
       openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
     })
   );

   // QA chain for tickets
   const ticketQA = RetrievalQA.fromChainType({
     llm: new ChatOpenAI({ openAIApiKey: Deno.env.get("OPENAI_API_KEY") }),
     chainType: "stuff",
     retriever: ticketVectorStore.asRetriever(),
   });

   // Example list of tools:
   const tools = [
     new Tool({
       name: "Ticket Query System",
       func: ticketQA.run,
       description: "Answer questions about tickets, status, or history",
     }),
     // more tools...
   ];

   // Initialize an agent with these tools
   const agent = initializeAgent(tools, new ChatOpenAI({
       openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
     }), {
       agentType: AgentType.ZERO_SHOT_REACT_DESCRIPTION,
       verbose: true
   });

   // Example usage
   export async function handleAdminAgentRequest(conversationHistory, newUserMessage) {
     try {
       const response = await agent.run(newUserMessage);
       return response;
     } catch (error) {
       console.error("Error in handleAdminAgentRequest:", error);
       return "Error processing your request.";
     }
   }
   ```
   - The agent automatically picks the best tool based on the user query.

---

## Remaining Tasks

1. **Finish "summarizeTickets.ts" (Step 6)**  
2. **Complete Admin Console UI & Store Setup (Substeps 12a, 12b)**  
3. **Create or refine any additional Zod schemas (Step 1b)**  
4. **Implement background jobs for embedding backfill (if needed)**  
5. **Add thorough testing & monitoring**  
6. **Document the final system architecture**  

---

## Final Notes

• Once all steps are complete, run "yarn supabase functions deploy adminAgent" to deploy your Edge Function.  
• Make sure environment variables—for example, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY—are set in your Supabase dashboard.  
• (Optional) Integrate LangSmith for advanced logging or chain visualization.  
• Regularly review performance, error logs, and cost usage in your AI stack.

By following this single consolidated document, you can systematically build (and track progress on) your Admin AI system—from initial Supabase Edge Functions, to advanced LLM patterns with vector embeddings, to a user-friendly admin console. Good luck!