import { Client, RunTree } from "npm:langsmith@0.2.0";
import { LangChainTracer } from "npm:langchain@0.1.21/callbacks";
import { v4 as uuidv4 } from "npm:uuid@9.0.0";

// Validate environment variables
const LANGSMITH_API_KEY = Deno.env.get("LANGSMITH_API_KEY");
const LANGCHAIN_TRACING_V2 = Deno.env.get("LANGCHAIN_TRACING_V2");
const LANGCHAIN_PROJECT = Deno.env.get("LANGCHAIN_PROJECT") || "cozycabin";
const LANGCHAIN_ENDPOINT = Deno.env.get("LANGCHAIN_ENDPOINT") || "https://api.smith.langchain.com";

if (!LANGSMITH_API_KEY) {
  console.error("LANGSMITH_API_KEY is not set in environment variables");
}

if (LANGCHAIN_TRACING_V2 !== "true") {
  console.warn("LANGCHAIN_TRACING_V2 is not set to 'true', tracing may not work as expected");
}

// Initialize LangSmith client with validation
export const client = new Client({
  apiKey: LANGSMITH_API_KEY,
  endpoint: LANGCHAIN_ENDPOINT
});

// Test the client connection
async function testLangSmithConnection() {
  try {
    // Use the client's built-in method to list projects
    const projects = await client.listProjects();
    console.log("LangSmith API connection test successful, found projects:", projects.length);
    return true;
  } catch (error) {
    console.error("LangSmith API connection test failed:", {
      error: error.message,
      type: error.name,
      stack: error.stack
    });
    return false;
  }
}

// Initialize LangChain tracer with validation
export const tracer = new LangChainTracer({
  projectName: LANGCHAIN_PROJECT
});

// Helper to wrap LangChain calls with tracing
export function withLangSmithTracing<T, Args extends any[]>(
  runName: string,
  fn: (...args: Args) => Promise<T>
) {
  // Return a properly bound function
  const wrappedFn = async (...args: Args): Promise<T> => {
    // Only proceed with tracing if LANGCHAIN_TRACING_V2 is enabled
    if (LANGCHAIN_TRACING_V2 !== "true") {
      console.warn("Tracing disabled - LANGCHAIN_TRACING_V2 is not 'true'");
      return fn(...args);
    }

    let runTree;
    
    try {
      // Create a unique ID for this run
      const runId = uuidv4();
      console.log('Creating new LangSmith run:', { runName, runId });

      // Create a RunTree instance
      runTree = new RunTree({
        name: runName,
        run_type: "chain",
        id: runId,
        project_name: LANGCHAIN_PROJECT,
        extra: {
          metadata: {
            environment: Deno.env.get("SUPABASE_URL") ? "production" : "development"
          }
        }
      });

      // Post the run to start it
      await runTree.postRun();
      console.log('LangSmith run created successfully:', { runId, runName });

      // Execute the wrapped function
      const result = await fn(...args);

      // End the run with the result
      await runTree.end({
        outputs: { result }
      });
      await runTree.patchRun();

      return result;
    } catch (error) {
      console.error("Error in run execution:", error);
      
      // If we have a runTree, try to end it with error
      if (runTree) {
        try {
          await runTree.end({
            error: error instanceof Error ? error.message : "Unknown error",
            outputs: { error }
          });
          await runTree.patchRun();
        } catch (endError) {
          console.error("Error ending run:", endError);
        }
      }
      
      // If tracing fails, still try to execute the function
      return fn(...args);
    }
  };

  // Ensure the function is properly bound and has a name
  Object.defineProperty(wrappedFn, 'name', { value: `${runName}_wrapped`, configurable: true });
  
  return wrappedFn;
}