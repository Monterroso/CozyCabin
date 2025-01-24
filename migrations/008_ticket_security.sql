-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY "Tickets are viewable by assigned agents and admins" ON tickets
FOR SELECT TO authenticated
USING ((auth.uid() IN (SELECT id FROM profiles WHERE role IN ('agent', 'admin'))) OR (assigned_to = auth.uid()));

CREATE POLICY "Tickets are viewable by their customers" ON tickets
FOR SELECT TO authenticated
USING (customer_id = auth.uid());

-- Update policies
CREATE POLICY "Tickets can be updated by assigned agents and admins" ON tickets
FOR UPDATE TO authenticated
USING (
  (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')) OR 
  (auth.uid() IN (SELECT id FROM profiles WHERE role = 'agent') AND assigned_to = auth.uid())
);

CREATE POLICY "Tickets can be updated by their customers" ON tickets
FOR UPDATE TO authenticated
USING (customer_id = auth.uid() AND status NOT IN ('closed', 'resolved'));

-- Insert policy
CREATE POLICY "Tickets can be created by authenticated users" ON tickets
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('customer', 'agent', 'admin')));