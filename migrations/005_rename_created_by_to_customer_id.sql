BEGIN;

-- 1) Add a new column called customer_id
ALTER TABLE tickets
  ADD COLUMN customer_id UUID REFERENCES auth.users (id);

-- 2) (Optional) If you want to set existing tickets’ customer_id to the same user
--    as created_by, you can run an UPDATE:
UPDATE tickets
SET customer_id = created_by
WHERE customer_id IS NULL;

COMMIT;