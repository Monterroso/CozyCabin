BEGIN;

-- Switch from referencing auth.users(id) to referencing public.profiles(id)
-- for tickets.created_by and tickets.assigned_to:
ALTER TABLE tickets
  DROP CONSTRAINT IF EXISTS tickets_created_by_fkey,
  DROP CONSTRAINT IF EXISTS tickets_assigned_to_fkey;

ALTER TABLE tickets
  ADD CONSTRAINT tickets_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES profiles (id)
    ON DELETE SET NULL,
  ADD CONSTRAINT tickets_assigned_to_fkey
    FOREIGN KEY (assigned_to) REFERENCES profiles (id)
    ON DELETE SET NULL;

---------------------------------------------------------
-- Switch for ticket_comments.user_id:
ALTER TABLE ticket_comments
  DROP CONSTRAINT IF EXISTS ticket_comments_user_id_fkey;

ALTER TABLE ticket_comments
  ADD CONSTRAINT ticket_comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles (id)
    ON DELETE CASCADE;

---------------------------------------------------------
-- Switch for ticket_attachments.uploaded_by:
ALTER TABLE ticket_attachments
  DROP CONSTRAINT IF EXISTS ticket_attachments_uploaded_by_fkey;

ALTER TABLE ticket_attachments
  ADD CONSTRAINT ticket_attachments_uploaded_by_fkey
    FOREIGN KEY (uploaded_by) REFERENCES profiles (id)
    ON DELETE CASCADE;

---------------------------------------------------------
-- Switch for invites.invited_by:
ALTER TABLE invites
  DROP CONSTRAINT IF EXISTS invites_invited_by_fkey;

ALTER TABLE invites
  ADD CONSTRAINT invites_invited_by_fkey
    FOREIGN KEY (invited_by) REFERENCES profiles (id)
    ON DELETE CASCADE;

COMMIT; 