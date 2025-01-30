import { RecursiveCharacterTextSplitter } from "npm:langchain/text_splitter";
import { SupabaseVectorStore } from "npm:langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "npm:langchain/embeddings/openai";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import type { Database } from "../_shared/database.types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Initialize document store
export const documentStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: "knowledge_base",
  queryName: "match_documents",
});

export async function storeDocument(
  document: {
    title: string;
    content: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    // Split document into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments(
      [document.content],
      [{ 
        title: document.title,
        ...document.metadata
      }]
    );

    // Store chunks in vector store
    await documentStore.addDocuments(chunks);

    return {
      success: true,
      chunks: chunks.length,
      title: document.title
    };
  } catch (error) {
    console.error("Error storing document:", error);
    throw error;
  }
}

export async function searchDocuments(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    metadata?: Record<string, any>;
  } = {}
) {
  try {
    const { limit = 5, threshold = 0.8, metadata } = options;

    const results = await documentStore.similaritySearch(
      query,
      limit,
      metadata ? { filter: metadata } : undefined
    );

    return results.map(doc => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      score: doc.metadata.similarity as number
    }));
  } catch (error) {
    console.error("Error searching documents:", error);
    throw error;
  }
}

export async function deleteDocument(title: string) {
  try {
    const { error } = await supabase
      .from("knowledge_base")
      .delete()
      .eq("metadata->title", title);

    if (error) throw error;

    return {
      success: true,
      title
    };
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
} 