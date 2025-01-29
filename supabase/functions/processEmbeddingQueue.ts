import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { OpenAIEmbeddings } from "npm:langchain/embeddings/openai";
import { withAiLogging } from "./tools/aiLogger.ts";
import type { Database } from "./_shared/database.types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
});

const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 3;

const baseProcessQueue = async () => {
  try {
    // Get a batch of pending messages
    const { data: batch, error: fetchError } = await supabase
      .from('message_embedding_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', MAX_ATTEMPTS)
      .order('created_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) throw fetchError;
    if (!batch?.length) return { processed: 0, failed: 0 };

    let processed = 0;
    let failed = 0;

    // Process each message in the batch
    for (const item of batch) {
      try {
        // Mark as processing
        await supabase
          .from('message_embedding_queue')
          .update({ 
            status: 'processing',
            attempts: item.attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        // Generate embedding
        const vector = await embeddings.embedQuery(item.content);

        // Update message with embedding
        const { error: updateError } = await supabase
          .from('ticket_comments')
          .update({ embedding: vector })
          .eq('id', item.message_id);

        if (updateError) throw updateError;

        // Mark as completed
        await supabase
          .from('message_embedding_queue')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        processed++;
      } catch (error) {
        // Mark as failed
        await supabase
          .from('message_embedding_queue')
          .update({ 
            status: item.attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
            last_error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        failed++;
        console.error(`Error processing message ${item.message_id}:`, error);
      }
    }

    return { processed, failed };
  } catch (error) {
    console.error("Error processing embedding queue:", error);
    throw error;
  }
};

// Wrap with logging
export const processQueue = withAiLogging(
  "process_embedding_queue",
  baseProcessQueue
); 