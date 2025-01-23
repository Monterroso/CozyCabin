-- Make sure you run this in the SQL editor for your Supabase project
CREATE POLICY "Allow insert for all authenticated users, matching user_id"
ON public.ticket_attachments
FOR INSERT
TO authenticated
WITH CHECK ( uploaded_by = auth.uid() );

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated insert into ticket-attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');