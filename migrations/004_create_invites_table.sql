-- Create invites table
CREATE TABLE invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  used_at TIMESTAMPTZ,
  
  CONSTRAINT valid_role CHECK (role IN ('agent', 'admin'))
);

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Only admins can create invites
CREATE POLICY "Admins can create invites"
  ON invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Admins can view all invites
CREATE POLICY "Admins can view invites"
  ON invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function to create an invite
CREATE OR REPLACE FUNCTION create_invite(
  invite_email TEXT,
  invite_role user_role
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token UUID;
BEGIN
  -- Verify the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only administrators can create invites';
  END IF;

  -- Verify the role is valid (not customer)
  IF invite_role = 'customer' THEN
    RAISE EXCEPTION 'Cannot create invites for customer role';
  END IF;

  -- Create the invite
  INSERT INTO invites (email, role, invited_by, token)
  VALUES (invite_email, invite_role, auth.uid(), gen_random_uuid())
  RETURNING token INTO new_token;

  RETURN new_token;
END;
$$;

-- Function to verify and consume an invite
CREATE OR REPLACE FUNCTION verify_invite(token UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  invite_email TEXT,
  invite_role user_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE invites
  SET used_at = NOW()
  WHERE invites.token = token
    AND used_at IS NULL
    AND expires_at > NOW()
  RETURNING 
    TRUE,
    email,
    role;
    
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      FALSE,
      NULL::TEXT,
      NULL::user_role;
  END IF;
END;
$$; 