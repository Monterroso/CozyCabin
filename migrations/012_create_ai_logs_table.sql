-- Create the ai_logs table for tracking AI operations
CREATE TABLE public.ai_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  error_type TEXT,
  response_time_ms DOUBLE PRECISION NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for common queries
CREATE INDEX idx_ai_logs_feature_name ON public.ai_logs(feature_name);
CREATE INDEX idx_ai_logs_success ON public.ai_logs(success);
CREATE INDEX idx_ai_logs_created_at ON public.ai_logs(created_at);

-- Add a comment to describe the table
COMMENT ON TABLE public.ai_logs IS 'Logs of AI operations including performance metrics and error tracking';

-- RLS policies
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view logs
CREATE POLICY "Allow admins to view logs" ON public.ai_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  ); 