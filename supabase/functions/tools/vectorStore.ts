import { RecursiveCharacterTextSplitter } from "npm:langchain/text_splitter";
import { SupabaseVectorStore } from "npm:langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "npm:langchain/embeddings/openai";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import type { Database } from "../_shared/database.types.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Create vector store instance
export const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: "tickets",
  queryName: "match_tickets",
});

export async function updateTicketEmbeddings(
  ticketId: string,
  content: string
): Promise<boolean> {
  try {
    const vector = await embeddings.embedQuery(content);
    
    const { error } = await supabase
      .from("tickets")
      .update({ embedding: vector })
      .eq("id", ticketId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating ticket embeddings:", error);
    return false;
  }
}

export async function findSimilarTickets(
  content: string,
  options: {
    match_threshold?: number;
    match_count?: number;
  } = {}
) {
  try {
    const vector = await embeddings.embedQuery(content);
    
    const { data, error } = await supabase
      .rpc("match_tickets", {
        query_embedding: vector,
        match_threshold: options.match_threshold ?? 0.78,
        match_count: options.match_count ?? 10
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error finding similar tickets:", error);
    return [];
  }
} 