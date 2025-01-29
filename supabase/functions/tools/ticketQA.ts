import { ChatOpenAI } from "langchain/chat_models/openai";
import { RetrievalQAChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { vectorStore } from "./vectorStore";
import { withAiLogging } from "./aiLogger";

const chatModel = new ChatOpenAI({
  openAIApiKey: Deno.env.get("OPENAI_API_KEY"),
  temperature: 0.3,
  modelName: "gpt-4-turbo-preview",
});

// Custom prompt template for ticket QA
const qaPrompt = PromptTemplate.fromTemplate(`
You are a helpful support agent assistant. Use the following context about similar tickets to answer the question.
Be concise and professional. If you can't find a relevant answer in the context, say so.

Context from similar tickets:
{context}

Question: {question}
`);

// Base QA chain setup
const baseTicketQA = async (question: string) => {
  const chain = RetrievalQAChain.fromLLM(
    chatModel,
    vectorStore.asRetriever({
      searchKwargs: {
        match_threshold: 0.78,
        match_count: 5
      }
    }),
    {
      prompt: qaPrompt,
      returnSourceDocuments: true,
      verbose: false
    }
  );

  const response = await chain.call({
    query: question
  });

  return {
    answer: response.text,
    sources: response.sourceDocuments?.map(doc => doc.metadata)
  };
};

// Wrap with logging
export const ticketQA = withAiLogging(
  "ticket_qa",
  baseTicketQA
);

// Function to find solutions for a specific ticket
const baseFindTicketSolutions = async (
  ticket: { subject: string; description?: string }
) => {
  const query = `Find solutions for this ticket:
Subject: ${ticket.subject}
Description: ${ticket.description ?? ""}`;

  return await ticketQA(query);
};

// Wrap with logging
export const findTicketSolutions = withAiLogging(
  "find_ticket_solutions",
  baseFindTicketSolutions
);

// Function to analyze ticket patterns
const baseAnalyzeTicketPatterns = async (
  timeframe: "day" | "week" | "month" = "week"
) => {
  const query = `What are the common patterns and trends in tickets from the past ${timeframe}?`;
  return await ticketQA(query);
};

// Wrap with logging
export const analyzeTicketPatterns = withAiLogging(
  "analyze_ticket_patterns",
  baseAnalyzeTicketPatterns
); 