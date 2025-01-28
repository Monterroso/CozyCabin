-- Create the ticket_category enum type
CREATE TYPE public.ticket_category AS ENUM (
  'billing',
  'technical',
  'account',
  'feature_request',
  'bug',
  'security',
  'other'
);

-- Add the category column to the tickets table
ALTER TABLE public.tickets
ADD COLUMN category public.ticket_category;

-- Add a comment to describe the column
COMMENT ON COLUMN public.tickets.category IS 'The category of the ticket, automatically determined by AI or manually set by admin'; 