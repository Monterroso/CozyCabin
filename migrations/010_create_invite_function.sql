-- First, remove any dependencies (policies, grants, etc.)
revoke all privileges on function create_invite(text, text) from authenticated;

-- Drop existing function with all parameter combinations
drop function if exists create_invite(text, text);
drop function if exists create_invite(text, user_role);

-- Create the invite function
create or replace function create_invite(invite_email text, invite_role text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_invite_id uuid;
  v_token uuid;
  v_user_exists boolean;
  v_user_role text;
begin
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  -- First check if the user exists in profiles
  select exists (
    select 1 from profiles where id = v_user_id
  ) into v_user_exists;

  if not v_user_exists then
    raise exception 'User not found in profiles table. User ID: %', v_user_id;
  end if;

  -- Get the user's role
  select role::text into v_user_role
  from profiles
  where id = v_user_id;

  -- Check if they're an admin
  if v_user_role != 'admin' then
    raise exception 'User found but does not have admin role. Current role: %', v_user_role;
  end if;

  -- Generate token
  v_token := gen_random_uuid();

  -- Generate a new invite
  insert into public.invites (
    email,
    role,
    invited_by,
    token,
    created_at,
    expires_at
  )
  values (
    invite_email,
    invite_role::user_role,
    v_user_id,
    v_token,
    now(),
    now() + interval '7 days'
  )
  returning token into v_token;

  return v_token;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function create_invite(text, text) to authenticated;

-- Add comment to the function
comment on function create_invite(text, text) is 'Creates a new invite record. Only administrators can create invites.';