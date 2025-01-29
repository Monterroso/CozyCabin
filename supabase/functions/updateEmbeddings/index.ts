import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { updateTicketEmbeddings } from "../tools/vectorStore.ts";
import { withAiLogging } from "../tools/aiLogger.ts";

const baseHandleEmbeddingUpdate = async (ticket: {
  id: string;
  subject: string;
  description?: string;
}) => {
  const content = `${ticket.subject}\n\n${ticket.description ?? ""}`;
  return await updateTicketEmbeddings(ticket.id, content);
};

const handleEmbeddingUpdate = withAiLogging(
  "update_embeddings",
  baseHandleEmbeddingUpdate
);

serve(async (req) => {
  try {
    const { record, type } = await req.json();

    // Only process insert or update operations
    if (type !== "INSERT" && type !== "UPDATE") {
      return new Response(
        JSON.stringify({ message: "Operation type not supported" }),
        { status: 400 }
      );
    }

    // Skip if no meaningful content change
    if (type === "UPDATE" && 
        !record.subject_changed && 
        !record.description_changed) {
      return new Response(
        JSON.stringify({ message: "No content changes" }),
        { status: 200 }
      );
    }

    const success = await handleEmbeddingUpdate({
      id: record.id,
      subject: record.subject,
      description: record.description
    });

    return new Response(
      JSON.stringify({ 
        success,
        message: success ? "Embedding updated" : "Failed to update embedding"
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: success ? 200 : 500
      }
    );
  } catch (error) {
    console.error("Error in updateEmbeddings function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "Internal server error",
        error: error.message 
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    );
  }
}); 