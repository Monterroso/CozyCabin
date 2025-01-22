-- Create user_role enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'customer', 'agent');
    END IF;
END $$;

-- Add email field and update profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles with email from auth.users
UPDATE profiles
SET email = (
  SELECT email
  FROM auth.users
  WHERE users.id = profiles.id
);

-- Make email required for new rows
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Create or replace the function that inserts a new profile on user creation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_text text;
BEGIN
  -- Pull the 'role' text from raw_user_meta_data; default to 'customer'.
  user_role_text := (NEW.raw_user_meta_data->>'role');
  IF user_role_text IS NULL THEN
    user_role_text := 'customer';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,  -- from auth.users
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    user_role_text::public.user_role
  );

  RETURN NEW;
END;
$$;

-- Create a trigger on the auth.users table to call your function after insert.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();