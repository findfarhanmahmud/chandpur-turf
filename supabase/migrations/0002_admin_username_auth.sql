-- ============================================================================
-- Chandpur Turf — Username-based admin authentication
--
-- Adds a `username` identity to admin_users, provisions the default admin
-- (admin123 / admin123) with a bcrypt-hashed password via Supabase Auth, and
-- exposes the secure login + credential-update RPCs. Supabase Auth remains
-- the session/identity layer (RLS, requireAdmin/requireAdminApi unchanged);
-- the internal email is fully abstracted from the admin UI.
-- ============================================================================

-- pgcrypto provides crypt()/gen_salt() for bcrypt verification/hashing.
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 1. Username on admin_users
-- ---------------------------------------------------------------------------
alter table public.admin_users add column if not exists username text;

-- Backfill existing admins from the local-part of their (internal) email.
update public.admin_users
set username = lower(split_part(email, '@', 1))
where username is null or btrim(username) = '';

alter table public.admin_users alter column username set not null;

-- Case-insensitive uniqueness so "Admin123" and "admin123" cannot coexist.
create unique index if not exists admin_users_username_uq
  on public.admin_users (lower(username));

-- ---------------------------------------------------------------------------
-- 2. Brute-force throttle table
-- ---------------------------------------------------------------------------
create table if not exists public.admin_login_attempts (
  username     text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_username_at_idx
  on public.admin_login_attempts (username, attempted_at);

-- RLS enabled with no policies: only the SECURITY DEFINER RPC (owner) can
-- touch this table; anonymous/authenticated direct access is denied.
alter table public.admin_login_attempts enable row level security;

-- ---------------------------------------------------------------------------
-- 3. Login RPC: username + password -> internal auth email
--
-- SECURITY DEFINER so it can read admin_users + auth.users for an anonymous
-- caller. The internal email is returned ONLY when the password verifies
-- against the stored bcrypt hash, so the email can never be enumerated and
-- wrong passwords never reach GoTrue's /token endpoint.
-- ---------------------------------------------------------------------------
create or replace function public.authenticate_admin(
  p_username text,
  p_password text
)
returns table (ok boolean, email text, display_name text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email    text;
  v_enc      text;
  v_display  text;
  v_id       uuid;
  v_failures integer;
  v_username text := lower(btrim(coalesce(p_username, '')));
begin
  delete from public.admin_login_attempts
  where attempted_at < now() - interval '15 minutes';

  select a.id, a.email, a.display_name, u.encrypted_password
    into v_id, v_email, v_display, v_enc
  from public.admin_users a
  join auth.users u on u.id = a.id
  where lower(a.username) = v_username and a.is_active;

  if v_id is not null then
    select count(*) into v_failures
    from public.admin_login_attempts
    where username = v_username;

    if v_failures >= 10 then
      return query select false, null::text, null::text;
      return;
    end if;

    if v_enc is not null and crypt(p_password, v_enc) = v_enc then
      delete from public.admin_login_attempts where username = v_username;
      return query select true, v_email, v_display;
      return;
    end if;
  end if;

  -- Record a failure (also for unknown usernames so the response is uniform).
  insert into public.admin_login_attempts (username, attempted_at)
  values (v_username, now());

  return query select false, null::text, null::text;
end;
$$;

revoke all on function public.authenticate_admin(text, text) from anon, public;
grant execute on function public.authenticate_admin(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Username update RPC (self-service, current admin only)
--
-- admin_users has no UPDATE RLS policy, so this SECURITY DEFINER function is
-- the only path that mutates a username; it re-verifies the caller is an
-- active admin from the session and rejects duplicates.
-- ---------------------------------------------------------------------------
create or replace function public.update_admin_username(p_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_username text := lower(btrim(coalesce(p_username, '')));
begin
  if v_uid is null then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.admin_users where id = v_uid and is_active) then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;

  if v_username = ''
     or length(v_username) < 3
     or length(v_username) > 30
     or v_username !~ '^[a-z0-9_.-]+$' then
    raise exception 'INVALID_USERNAME' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.admin_users
    where lower(username) = v_username and id <> v_uid
  ) then
    raise exception 'USERNAME_TAKEN' using errcode = 'P0001';
  end if;

  update public.admin_users set username = v_username where id = v_uid;
end;
$$;

revoke all on function public.update_admin_username(text) from anon, public;
grant execute on function public.update_admin_username(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Default admin provisioning (fresh-install seed)
--
-- Idempotent: does nothing once an admin with username 'admin123' exists.
-- The password is hashed by Supabase Auth (bcrypt) — never stored plaintext.
-- The internal email 'admin@chandpur-turf.local' is never surfaced in the UI.
-- ---------------------------------------------------------------------------
create or replace function public.ensure_default_admin()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email    text := 'admin@chandpur-turf.local';
  v_username text := 'admin123';
  v_password text := 'admin123';
  v_id       uuid;
  v_res      json;
begin
  if exists (select 1 from public.admin_users where lower(username) = v_username) then
    return;
  end if;

  -- Reuse the auth user if it was already created (e.g. on a retry).
  select id into v_id from auth.users where lower(email) = v_email;

  if v_id is null then
    begin
      -- Preferred path: GoTrue's own user creation (handles identities,
      -- email confirmation, and bcrypt hashing consistently).
      select auth.admin_create_user(
        v_email, v_password, true, '{"username":"admin123"}'::jsonb
      ) into v_res;
      v_id := (v_res->>'id')::uuid;
    exception when others then
      -- Fallback direct insert (used only if admin_create_user is missing).
      v_id := gen_random_uuid();
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) values (
        v_id, '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated',
        v_email, crypt(v_password, gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"username":"admin123"}'::jsonb, now(), now()
      );
      insert into auth.identities (
        id, user_id, provider_id, provider, identity_data,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), v_id, v_id::text, 'email',
        jsonb_build_object('sub', v_id::text, 'email', v_email),
        now(), now(), now()
      );
    end;
  end if;

  if v_id is null then
    raise exception 'DEFAULT_ADMIN_FAILED';
  end if;

  insert into public.admin_users (id, email, username, display_name, role, is_active)
  values (v_id, v_email, v_username, 'Administrator', 'super_admin', true)
  on conflict (id) do update
    set username    = v_username,
        display_name = 'Administrator',
        role         = 'super_admin',
        is_active    = true;
end;
$$;

revoke all on function public.ensure_default_admin() from anon, public;

-- Run the seed now so the default admin exists immediately after migration.
select public.ensure_default_admin();

-- ---------------------------------------------------------------------------
-- 6. promote_admin: support an optional username (backward compatible)
-- ---------------------------------------------------------------------------
create or replace function public.promote_admin(
  p_email    text,
  p_role     text default 'admin',
  p_username text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid;
  v_username text;
begin
  if current_user <> 'postgres'
     and (auth.uid() is null or not public.is_admin()) then
    raise exception 'FORBIDDEN';
  end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(btrim(p_email));

  if v_user_id is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  v_username := coalesce(
    nullif(btrim(p_username), ''),
    lower(split_part(btrim(p_email), '@', 1))
  );

  if v_username = '' or v_username !~ '^[a-z0-9_.-]+$' then
    raise exception 'INVALID_USERNAME';
  end if;

  if exists (
    select 1 from public.admin_users
    where lower(username) = v_username and id <> v_user_id
  ) then
    raise exception 'USERNAME_TAKEN';
  end if;

  insert into public.admin_users (id, email, username, role, is_active)
  values (v_user_id, btrim(p_email), v_username, p_role, true)
  on conflict (id) do update
    set email     = excluded.email,
        username  = excluded.username,
        role      = excluded.role,
        is_active = true;
end;
$$;

revoke all on function public.promote_admin(text, text) from anon, public;
revoke all on function public.promote_admin(text, text, text) from anon, public;
grant execute on function public.promote_admin(text, text) to authenticated;
grant execute on function public.promote_admin(text, text, text) to authenticated;
