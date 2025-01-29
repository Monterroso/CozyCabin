import { createClient } from "@supabase/supabase-js";
import type { Database } from "../_shared/database.types";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface AiLogRecord {
  feature_name: string;
  success: boolean;
  error_type?: string;
  response_time_ms: number;
  metadata?: Record<string, unknown>;
}

// Helper function to insert log record
async function insertLogRecord(record: AiLogRecord) {
  try {
    const { error } = await supabase
      .from("ai_logs")
      .insert([record]);

    if (error) {
      console.error("Failed to insert AI log record:", error);
    }
  } catch (error) {
    console.error("Error in insertLogRecord:", error);
  }
}

// Higher-order function to wrap AI functions with logging
export function withAiLogging<T extends (...args: any[]) => Promise<any>>(
  featureName: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const endTime = performance.now();
      
      // Log successful operation
      await insertLogRecord({
        feature_name: featureName,
        success: true,
        response_time_ms: endTime - startTime,
        metadata: {
          args: args.map(arg => 
            // Safely stringify arguments, excluding sensitive data
            typeof arg === 'object' ? 
              JSON.stringify(arg, (_, value) => 
                typeof value === 'string' && value.includes('@') ? '[REDACTED]' : value
              ) : 
              String(arg)
          ),
          result: typeof result === 'object' ? 
            JSON.stringify(result, (_, value) => 
              typeof value === 'string' && value.includes('@') ? '[REDACTED]' : value
            ) : 
            String(result)
        }
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      
      // Log failed operation
      await insertLogRecord({
        feature_name: featureName,
        success: false,
        error_type: error.name,
        response_time_ms: endTime - startTime,
        metadata: {
          error_message: error.message,
          args: args.map(arg => 
            typeof arg === 'object' ? 
              JSON.stringify(arg, (_, value) => 
                typeof value === 'string' && value.includes('@') ? '[REDACTED]' : value
              ) : 
              String(arg)
          )
        }
      });

      throw error; // Re-throw to maintain original error handling
    }
  }) as T;
} 