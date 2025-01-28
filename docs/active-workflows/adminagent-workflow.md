# Admin Agent Checklist

Below is a step-by-step checklist of tasks to implement your free-flowing Admin AI system using:

• Supabase (with pgvector)  
• LangChain (and LangSmith for observability)  
• File splitting/chunking when necessary (for document retrieval or summarization)  

To keep each step manageable, each checklist item refers to edits in exactly one file. If a step needs more than one file change, it is split into substeps.

---

## 1. Create a “CHECKLIST.md” (This File)
1. [X] In your project root, create a new file named CHECKLIST.md (this file).  
   - Purpose: Track the tasks needed for your Admin AI system.  
   - State: No code change yet, just documentation.

---

## 2. Create “supabase/functions/adminAgent/index.ts”
1. [ ] Navigate to supabase/functions/adminAgent/ and create an index.ts file (if it does not already exist).
2. [ ] Inside index.ts, set up the basic handle for receiving requests in Deno.  
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
   - State: A new serverless function that can handle the admin’s requests for ticket summarization, categorization, assignment, etc.

---

## 3. Create “supabase/functions/tools/agentOrchestrator.ts”
1. [ ] In supabase/functions/tools/, create a file named agentOrchestrator.ts.  
2. [ ] Put high-level orchestration logic here (using LangChain or any direct LLM calls). For example:
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
   - Purpose: Central “agent” logic. It decides which tool function to call for each user query.  
   - State: A single orchestration file to keep your function entry point simpler.

---

## 4. Create “supabase/functions/tools/getUnassignedTickets.ts”
1. [ ] In supabase/functions/tools/, create a file named getUnassignedTickets.ts.
2. [ ] Fetch tickets from Supabase with assigned_to = null, using the Deno-compatible Supabase client:
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
   - State: Returns an array of ticket rows. Doesn’t alter your DB.

---

## 5. Create “supabase/functions/tools/summarizeTickets.ts”
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
   - Purpose: Provide a short text summary of multiple tickets using LangChain’s ChatOpenAI model.  
   - State: No database changes. Returns a string summary.

---

## 6. Create “supabase/functions/tools/categorizeTicket.ts”
1. [ ] In supabase/functions/tools/, create categorizeTicket.ts.
2. [ ] Use LangChain or direct OpenAI calls to predict a category:
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

## 7. Create “supabase/functions/tools/updateTicket.ts”
1. [ ] In supabase/functions/tools/, create a file named updateTicket.ts.
2. [ ] This function updates the “tickets” table to set new tags, assigned_to, or other fields:
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

## 8. (Optional) Create “supabase/functions/tools/insertAiLogRecord.ts”
1. [ ] In supabase/functions/tools/, make a file named insertAiLogRecord.ts if you want to track metrics in an “ai_logs” table.
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
   - Purpose: Keep track of usage, success/fail events, or timing data in “ai_logs.”  
   - State: Each call inserts a row into the logging table.

---

## 9. Add a “pgvector” Table and File Chunking (If Needed for Documents)
Sometimes you want the agent to read large documents or knowledge base to answer ticket-related queries.

### Step 9a: Create “supabase/functions/tools/setupPgVector.ts” (One-file edit)
1. [ ] Make a function to help with pgvector indexing or upserts. 
   ```ts:supabase/functions/tools/setupPgVector.ts
   // Pseudocode for how you might initialize a table with a "vector" column
   // In practice, you'd do a migration or run raw SQL.
   // Make sure your supabase is enabled with the pgvector extension.
   ```
   - Purpose: Provide any custom logic for vector-based searching or storing embeddings.  
   - State: This step might also involve a Supabase migration so your “embedding” column is a vector type.

### Step 9b: Create “supabase/functions/tools/fileChunking.ts” (One-file edit)
1. [ ] Implement a function that splits large files or text into smaller chunks, then stores embeddings in your “pgvector” table:
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

## 10. Create a Minimal Front-End to Call the Edge Function
### Step 10a: “src/pages/AdminConsole.tsx”
1. [ ] In your React project (outside of supabase/functions), add a page or component named AdminConsole.tsx.
2. [ ] Implement a chat interface that calls your Edge Function endpoint:
   ```tsx:src/pages/AdminConsole.tsx
   import React, { useState } from "react";

   export default function AdminConsole() {
     const [messages, setMessages] = useState<
       { role: "user" | "assistant"; content: string }[]
     >([]);
     const [input, setInput] = useState("");

     async function sendMessage() {
       const newMessage = { role: "user", content: input };
       setMessages([...messages, newMessage]);
       setInput("");

       // Post to your deployed edge function endpoint
       const response = await fetch("/api/edge-proxy", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ messages, newUserMessage: input }),
       }).then((r) => r.json());

       setMessages([...messages, newMessage, { role: "assistant", content: response.reply }]);
     }

     return (
       <div>
         <h1>Admin AI Console</h1>
         <div style={{ border: "1px solid gray", height: "300px", overflowY: "auto" }}>
           {messages.map((m, i) => (
             <p key={i}>
               <strong>{m.role}:</strong> {m.content}
             </p>
           ))}
         </div>
         <input
           value={input}
           onChange={(e) => setInput(e.target.value)}
           placeholder="Ask the agent something..."
         />
         <button onClick={sendMessage}>Send</button>
       </div>
     );
   }
   ```
   - Purpose: Provide a simple UI for your admin to type requests and see the agent’s responses.
   - State: Each user message is added to local React state, and each response from the function is appended as well.  

### Step 10b: “src/pages/api/edge-proxy.ts” (Optional if you’re using Next.js)
1. [ ] Create an API route that proxies requests to your Supabase Edge Function:
   ```ts:src/pages/api/edge-proxy.ts
   import type { NextApiRequest, NextApiResponse } from "next";

   export default async function edgeProxy(req: NextApiRequest, res: NextApiResponse) {
     try {
       const result = await fetch("https://<PROJECT>.functions.supabase.co/adminAgent", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(req.body),
       });
       const data = await result.json();
       res.status(200).json(data);
     } catch (error) {
       res.status(500).json({ reply: "Error calling Edge Function" });
     }
   }
   ```
   - Purpose: Let your admin front end talk to the deployed Edge Function.  
   - State: No direct DB changes; just a pass-through.

---

## Final Notes
• Run "yarn supabase functions deploy adminAgent" to deploy your Edge Function with all these files included.  
• Confirm your environment variables are set in the Supabase dashboard for Deno runtime (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, LangChain keys, etc.).  
• With each step completed, your “tools” can be orchestrated by the agent. You have the option to add pgvector embeddings, file chunking, and LangSmith for advanced logging or chain visualization.  

By following these checklist items in order, you keep each step confined to editing a single file or a single set of small substeps, making it easier to manage in your codebase.