import { RetrievalQAChain } from "npm:langchain/chains";
import { PromptTemplate } from "npm:langchain/prompts";
import { vectorStore } from "./vectorStore.ts";
import { chatModel } from "../_shared/models.ts";

// Custom prompt template for ticket QA
const qaPrompt = PromptTemplate.fromTemplate(`
You are a helpful support agent assistant. Use the following context about similar tickets to answer the question.
Be concise and professional. If you can't find a relevant answer in the context, say so.

Context from similar tickets:
{context}

Question: {question}
`);

export async function ticketQA(question: string) {
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
      verbose: false,
    }
  );

  const response = await chain.call({
    query: question
  });

  return {
    answer: response.text,
    sources: response.sourceDocuments?.map(doc => doc.metadata)
  };
}

export async function findTicketSolutions(
  ticket: { subject: string; description?: string }
) {
  const query = `Find solutions for this ticket:
Subject: ${ticket.subject}
Description: ${ticket.description ?? ""}`;

  return await ticketQA(query);
}

export async function analyzeTicketPatterns(
  timeframe: "day" | "week" | "month" = "week"
) {
  const query = `What are the common patterns and trends in tickets from the past ${timeframe}?`;
  return await ticketQA(query);
} 