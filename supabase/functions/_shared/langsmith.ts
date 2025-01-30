import { Client } from "npm:langsmith@0.1.10";
import { LangChainTracer } from "npm:langchain@0.1.21/callbacks";

// Initialize LangSmith client
export const client = new Client({
  apiKey: Deno.env.get("LANGSMITH_API_KEY"),
});

// Initialize LangChain tracer
export const tracer = new LangChainTracer({
  projectName: "cozycabin",
});

// Helper to wrap LangChain calls with tracing
export function withLangSmithTracing<T, Args extends any[]>(
  runName: string,
  fn: (...args: Args) => Promise<T>
) {
  // Return a properly bound function
  const wrappedFn = async (...args: Args): Promise<T> => {
    let currentRun;
    try {
      // Create and await the run before proceeding
      currentRun = await client.createRun({
        name: runName,
        project_name: "cozycabin",
        run_type: "chain",
        extra: {
          metadata: {
            environment: Deno.env.get("SUPABASE_URL") ? "production" : "development"
          }
        }
      });

      // Execute the wrapped function
      const result = await fn(...args);

      // Only try to end the run if it was successfully created
      if (currentRun) {
        await currentRun.end({
          outputs: { result }
        });
      }

      return result;
    } catch (error) {
      // Only try to end the run if it was successfully created
      if (currentRun) {
          await currentRun.end({
          error: error instanceof Error ? error.message : "Unknown error",
          outputs: { error }
          });
      } else {
        console.error("Failed to create LangSmith run:", error);
        }
      throw error;
    }
  };

  // Ensure the function is properly bound and has a name
  Object.defineProperty(wrappedFn, 'name', { value: `${runName}_wrapped`, configurable: true });
  
  return wrappedFn;
} 