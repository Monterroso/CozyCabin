-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the main tickets table
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'normal',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Create ticket_comments table for conversation history
CREATE TABLE ticket_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ticket_attachments table
CREATE TABLE ticket_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES ticket_comments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX tickets_created_by_idx ON tickets(created_by);
CREATE INDEX tickets_assigned_to_idx ON tickets(assigned_to);
CREATE INDEX tickets_status_idx ON tickets(status);
CREATE INDEX tickets_created_at_idx ON tickets(created_at);
CREATE INDEX ticket_comments_ticket_id_idx ON ticket_comments(ticket_id);
CREATE INDEX ticket_attachments_ticket_id_idx ON ticket_attachments(ticket_id);

-- Add triggers for updated_at
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at
  BEFORE UPDATE ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Tickets policies
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Agents can view all tickets"
  ON tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Customers can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Agents can update tickets"
  ON tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('agent', 'admin')
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments on their tickets"
  ON ticket_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_comments.ticket_id
      AND (tickets.created_by = auth.uid() OR NOT ticket_comments.is_internal)
    )
  );

CREATE POLICY "Agents can view all comments"
  ON ticket_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Users can create comments on their tickets"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_comments.ticket_id
      AND tickets.created_by = auth.uid()
    )
  );

CREATE POLICY "Agents can create comments"
  ON ticket_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('agent', 'admin')
    )
  );

-- Attachments policies
CREATE POLICY "Users can view attachments on their tickets"
  ON ticket_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_attachments.ticket_id
      AND tickets.created_by = auth.uid()
    )
  );

CREATE POLICY "Agents can view all attachments"
  ON ticket_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Users can upload attachments to their tickets"
  ON ticket_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_attachments.ticket_id
      AND tickets.created_by = auth.uid()
    )
  );

CREATE POLICY "Agents can upload attachments"
  ON ticket_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('agent', 'admin')
    )
  );

-- Create function for getting agent performance stats
CREATE OR REPLACE FUNCTION get_agent_performance_stats()
RETURNS TABLE (
  assigned_tickets bigint,
  resolved_today bigint,
  average_response_time float,
  satisfaction_rate float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agent_id uuid;
BEGIN
  agent_id := auth.uid();
  
  RETURN QUERY
  WITH response_times AS (
    SELECT
      t.id,
      MIN(c.created_at) - t.created_at as first_response_time
    FROM tickets t
    LEFT JOIN ticket_comments c ON c.ticket_id = t.id
    WHERE t.assigned_to = agent_id
    GROUP BY t.id, t.created_at
  ),
  satisfaction AS (
    SELECT
      COUNT(*) FILTER (WHERE status = 'solved') as solved_count,
      COUNT(*) as total_count
    FROM tickets
    WHERE assigned_to = agent_id
  )
  SELECT
    COUNT(*) FILTER (WHERE assigned_to = agent_id) as assigned_tickets,
    COUNT(*) FILTER (WHERE status = 'solved' AND closed_at >= CURRENT_DATE) as resolved_today,
    EXTRACT(epoch FROM AVG(first_response_time))/60 as average_response_time,
    COALESCE(solved_count::float / NULLIF(total_count, 0), 0) as satisfaction_rate
  FROM tickets
  CROSS JOIN satisfaction
  LEFT JOIN response_times ON response_times.id = tickets.id
  WHERE assigned_to = agent_id;
END;
$$; 