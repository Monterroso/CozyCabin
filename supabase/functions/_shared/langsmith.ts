import { Client } from "npm:langsmith";
import { LangChainTracer } from "npm:langchain/callbacks";

// Initialize LangSmith client
const client = new Client({
  apiKey: Deno.env.get("LANGSMITH_API_KEY"),
  projectName: "cozycabin", // Your project name
});

// Create a tracer that can be used across functions
export const tracer = new LangChainTracer({
  projectName: "cozycabin",
  client,
});

// Helper to wrap LangChain calls with tracing
export function withLangSmithTracing<T>(
  runName: string,
  fn: () => Promise<T>
): Promise<T> {
  return client.createRun(
    {
      name: runName,
      project_name: "cozycabin",
      run_type: "chain",
      extra: {
        metadata: {
          // Use a simple check based on whether we're in a Supabase environment
          environment: Deno.env.get("SUPABASE_URL") ? "production" : "development"
        }
      }
    },
    { execution_order: 1 },
    async (run) => {
      try {
        const result = await fn();
        await run.end({
          outputs: { result }
        });
        return result;
      } catch (error) {
        await run.end({
          error: error instanceof Error ? error.message : "Unknown error",
          outputs: { error }
        });
        throw error;
      }
    }
  );
} 