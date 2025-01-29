-- Create knowledge base table
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for similarity search
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx 
ON public.knowledge_base
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to match similar documents
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add RLS policies
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read knowledge base
CREATE POLICY "Allow authenticated users to read knowledge base"
ON public.knowledge_base
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow service role to manage knowledge base
CREATE POLICY "Allow service role to manage knowledge base"
ON public.knowledge_base
USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_knowledge_base_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_updated_at();

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS knowledge_base_metadata_title_idx 
ON public.knowledge_base USING gin ((metadata -> 'title'));

CREATE INDEX IF NOT EXISTS knowledge_base_created_at_idx 
ON public.knowledge_base(created_at);

COMMENT ON TABLE public.knowledge_base IS 'Stores document chunks with embeddings for semantic search';
COMMENT ON COLUMN public.knowledge_base.content IS 'The text content of the document chunk';
COMMENT ON COLUMN public.knowledge_base.metadata IS 'Additional metadata like title, category, tags, etc';
COMMENT ON COLUMN public.knowledge_base.embedding IS 'Vector embedding of the content for similarity search'; 