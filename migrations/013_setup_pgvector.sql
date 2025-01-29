-- Enable the pgvector extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create an index for similarity search
CREATE INDEX IF NOT EXISTS tickets_embedding_idx ON public.tickets 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to match similar tickets
CREATE OR REPLACE FUNCTION match_tickets(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  subject text,
  description text,
  priority public.ticket_priority,
  status public.ticket_status,
  category public.ticket_category,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.subject,
    t.description,
    t.priority,
    t.status,
    t.category,
    1 - (t.embedding <=> query_embedding) AS similarity
  FROM public.tickets t
  WHERE 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to update ticket embeddings
CREATE OR REPLACE FUNCTION update_ticket_embedding()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Trigger will be completed when we implement the Edge Function
  -- This ensures the column exists but doesn't process embeddings yet
  RETURN NEW;
END;
$$;

-- Create trigger for automatic embedding updates
CREATE OR REPLACE TRIGGER ticket_embedding_update
  BEFORE INSERT OR UPDATE OF subject, description
  ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_embedding();

-- Add RLS policy for embeddings
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read embeddings
CREATE POLICY "Allow users to read ticket embeddings" ON public.tickets
  FOR SELECT
  USING (auth.role() = 'authenticated');

COMMENT ON COLUMN public.tickets.embedding IS 'Vector embedding of ticket content for similarity search'; 