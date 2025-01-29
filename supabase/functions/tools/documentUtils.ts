import { storeDocument, searchDocuments, documentStore } from "./documentStore.ts";
import { withAiLogging } from "./aiLogger.ts";
import { ChatOpenAI } from "npm:langchain/chat_models/openai";
import { PromptTemplate } from "npm:langchain/prompts";

const chatModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
  modelName: "gpt-4-turbo-preview",
  temperature: 0.3,
});

// Base function to extract key information from a document
const baseExtractDocumentInfo = async (content: string) => {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Extract key information from the following document.
      Include:
      1. Main topics or themes
      2. Key points
      3. Any specific procedures or guidelines
      4. Important dates or deadlines
      5. Relevant stakeholders

      Document:
      {content}

      Provide the information in a structured format:
    `);

    const response = await chatModel.call([
      await prompt.format({ content })
    ]);

    return {
      extracted: response.text,
      success: true
    };
  } catch (error) {
    console.error("Error extracting document info:", error);
    throw error;
  }
};

// Base function to find relevant documentation for a ticket
const baseFindRelevantDocs = async (
  ticket: {
    subject: string;
    description?: string;
    category?: string;
  }
) => {
  try {
    const query = `${ticket.subject}\n${ticket.description ?? ""}`;
    
    // Search with category if available
    const results = await searchDocuments(query, {
      limit: 3,
      threshold: 0.75,
      metadata: ticket.category ? { category: ticket.category } : undefined
    });

    // If no results with category, try without
    if (results.length === 0 && ticket.category) {
      return await searchDocuments(query, {
        limit: 3,
        threshold: 0.7
      });
    }

    return results;
  } catch (error) {
    console.error("Error finding relevant docs:", error);
    throw error;
  }
};

// Base function to generate document summary
const baseGenerateDocumentSummary = async (
  documents: Array<{ content: string; metadata: Record<string, any> }>
) => {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Summarize the key points from these related documents.
      Focus on:
      1. Common themes
      2. Important procedures
      3. Critical information
      4. Any conflicts or discrepancies

      Documents:
      {documents}

      Provide a clear and concise summary:
    `);

    const formattedDocs = documents
      .map(doc => `Title: ${doc.metadata.title}\n${doc.content}`)
      .join("\n\n---\n\n");

    const response = await chatModel.call([
      await prompt.format({ documents: formattedDocs })
    ]);

    return {
      summary: response.text,
      documentCount: documents.length
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};

// Base function to suggest document updates
const baseSuggestDocumentUpdates = async (
  document: {
    title: string;
    content: string;
    metadata: Record<string, any>;
  },
  relatedTickets: Array<{
    subject: string;
    description?: string;
    resolution?: string;
  }>
) => {
  try {
    const prompt = PromptTemplate.fromTemplate(`
      Based on recent support tickets, suggest updates for this document.
      Consider:
      1. New issues or scenarios not covered
      2. Outdated information
      3. Common points of confusion
      4. Additional examples needed

      Current Document:
      Title: {title}
      Content: {content}

      Related Tickets:
      {tickets}

      Suggest specific updates and improvements:
    `);

    const formattedTickets = relatedTickets
      .map(ticket => `Subject: ${ticket.subject}\nDescription: ${ticket.description}\nResolution: ${ticket.resolution}`)
      .join("\n\n");

    const response = await chatModel.call([
      await prompt.format({
        title: document.title,
        content: document.content,
        tickets: formattedTickets
      })
    ]);

    return {
      suggestions: response.text,
      ticketsAnalyzed: relatedTickets.length
    };
  } catch (error) {
    console.error("Error suggesting updates:", error);
    throw error;
  }
};

// Wrap with logging
export const extractDocumentInfo = withAiLogging(
  "extract_document_info",
  baseExtractDocumentInfo
);

export const findRelevantDocs = withAiLogging(
  "find_relevant_docs",
  baseFindRelevantDocs
);

export const generateDocumentSummary = withAiLogging(
  "generate_document_summary",
  baseGenerateDocumentSummary
);

export const suggestDocumentUpdates = withAiLogging(
  "suggest_document_updates",
  baseSuggestDocumentUpdates
); 