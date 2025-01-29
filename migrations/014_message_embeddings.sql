-- Add embedding column to ticket_comments table
ALTER TABLE public.ticket_comments
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create an index for similarity search on messages
CREATE INDEX IF NOT EXISTS ticket_comments_embedding_idx 
ON public.ticket_comments
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to match similar messages
CREATE OR REPLACE FUNCTION match_messages(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  ticket_id uuid,
  content text,
  created_at timestamptz,
  created_by uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.id,
    tc.ticket_id,
    tc.content,
    tc.created_at,
    tc.created_by,
    1 - (tc.embedding <=> query_embedding) AS similarity
  FROM public.ticket_comments tc
  WHERE 1 - (tc.embedding <=> query_embedding) > match_threshold
  ORDER BY tc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create a queue table for message embeddings
CREATE TABLE IF NOT EXISTS public.message_embedding_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES public.ticket_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts int DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add index on status and created_at for efficient queue processing
CREATE INDEX IF NOT EXISTS message_embedding_queue_status_idx ON public.message_embedding_queue(status, created_at);

-- Function to queue message for embedding
CREATE OR REPLACE FUNCTION queue_message_for_embedding()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Queue the message for embedding processing
  INSERT INTO public.message_embedding_queue (message_id, content)
  VALUES (NEW.id, NEW.content);
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic message embedding queueing
DROP TRIGGER IF EXISTS message_embedding_queue_trigger ON public.ticket_comments;
CREATE TRIGGER message_embedding_queue_trigger
  AFTER INSERT OR UPDATE OF content
  ON public.ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION queue_message_for_embedding();

-- Add RLS policies
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_embedding_queue ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read message embeddings
CREATE POLICY "Allow users to read message embeddings" 
ON public.ticket_comments
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow service role to manage embedding queue
CREATE POLICY "Allow service role to manage embedding queue" 
ON public.message_embedding_queue
USING (auth.role() = 'service_role');

COMMENT ON TABLE public.message_embedding_queue IS 'Queue for processing message embeddings asynchronously';
COMMENT ON COLUMN public.ticket_comments.embedding IS 'Vector embedding of message content for similarity search'; 
