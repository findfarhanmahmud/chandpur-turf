-- ============================================================================
-- Chandpur Turf — Custom username/password admin authentication
--
-- Removes the Supabase Auth (email/password + GoTrue) dependency from the
-- admin panel. Admin credentials live in `admin_users` (bcrypt-hashed via
-- pgcrypto) and sessions are server-side HttpOnly cookies backed by the
-- `admin_sessions` table. Supabase Auth is NOT used for the admin login.
-- RLS policies are left fully intact (see 0001) — the admin API reads/writes
-- with the service role behind the session check, public/anon access is
-- unchanged.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Redesign admin_users: standalone, no auth.users / email dependency
-- ---------------------------------------------------------------------------
-- Drop the FK to auth.users so the admin registry no longer needs a Supabase
-- Auth user. Existing admin rows keep their ids.
alter table public.admin_users drop constraint if exists admin_users_id_fkey;

-- Future admins get their own generated id.
alter table public.admin_users alter column id set default gen_random_uuid();

-- The internal email identity is gone entirely.
alter table public.admin_users drop column if exists email;

-- Password hash (bcrypt via pgcrypto) + audit timestamp.
alter table public.admin_users add column if not exists password_hash text;
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();

-- Backfill any existing admins with the documented default seed password so a
-- deployed admin_users row remains usable after this migration.
update public.admin_users
set password_hash = extensions.crypt('admin123', extensions.gen_salt('bf', 10))
where password_hash is null;

alter table public.admin_users alter column password_hash set not null;

-- ---------------------------------------------------------------------------
-- 2. blocked_slots.created_by now tracks admin_users instead of auth.users
-- ---------------------------------------------------------------------------
alter table public.blocked_slots drop constraint if exists blocked_slots_created_by_fkey;
alter table public.blocked_slots add constraint blocked_slots_created_by_fkey
  foreign key (created_by) references public.admin_users (id) on delete set null;

-- ---------------------------------------------------------------------------
-- 3. Server-side session store (HttpOnly cookie token hashes)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_sessions (
  token_hash text primary key,                       -- sha256(token)
  admin_id   uuid not null references public.admin_users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_admin_id_idx
  on public.admin_sessions (admin_id);

-- No policies: only the SECURITY DEFINER RPCs below (or the service role) may
-- touch this table. Anonymous/authenticated direct access is denied.
alter table public.admin_sessions enable row level security;

-- ---------------------------------------------------------------------------
-- 4. Drop legacy functions tied to auth.users / email
-- ---------------------------------------------------------------------------
drop function if exists public.authenticate_admin(text, text);
drop function if exists public.update_admin_username(text);
drop function if exists public.ensure_default_admin();
drop function if exists public.promote_admin(text, text);
drop function if exists public.promote_admin(text, text, text);

-- ---------------------------------------------------------------------------
-- 5. Login RPC: username + password -> admin identity (throttled)
-- ---------------------------------------------------------------------------
create or replace function public.authenticate_admin(
  p_username text,
  p_password text
)
returns table (ok boolean, admin_id uuid, username text, display_name text, role text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_admin    public.admin_users%rowtype;
  v_username text := lower(btrim(coalesce(p_username, '')));
  v_failures integer;
begin
  delete from public.admin_login_attempts
  where attempted_at < now() - interval '15 minutes';

  select * into v_admin
  from public.admin_users
  where lower(username) = v_username and is_active;

  if v_admin.id is not null then
    select count(*) into v_failures
    from public.admin_login_attempts
    where username = v_username;

    if v_failures >= 10 then
      return query select false, null::uuid, null::text, null::text, null::text;
      return;
    end if;

    if v_admin.password_hash is not null
       and crypt(p_password, v_admin.password_hash) = v_admin.password_hash then
      delete from public.admin_login_attempts where username = v_username;
      return query
        select true, v_admin.id, v_admin.username, v_admin.display_name, v_admin.role;
      return;
    end if;
  end if;

  insert into public.admin_login_attempts (username, attempted_at)
  values (v_username, now());

  return query select false, null::uuid, null::text, null::text, null::text;
end;
$$;

revoke all on function public.authenticate_admin(text, text) from anon, public;
grant execute on function public.authenticate_admin(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. Session RPCs (service role only)
-- ---------------------------------------------------------------------------
create or replace function public.create_admin_session(
  p_token_hash text,
  p_admin_id   uuid,
  p_expires_at timestamptz
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_sessions (token_hash, admin_id, expires_at)
  values (p_token_hash, p_admin_id, p_expires_at);
$$;

create or replace function public.get_admin_session(p_token_hash text)
returns table (admin_id uuid, username text, display_name text, role text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select a.id, a.username, a.display_name, a.role
  from public.admin_sessions s
  join public.admin_users a on a.id = s.admin_id
  where s.token_hash = p_token_hash
    and s.expires_at > now()
    and a.is_active;
end;
$$;

create or replace function public.delete_admin_session(p_token_hash text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.admin_sessions where token_hash = p_token_hash;
$$;

create or replace function public.delete_all_admin_sessions(p_admin_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.admin_sessions where admin_id = p_admin_id;
$$;

revoke all on function public.create_admin_session(text, uuid, timestamptz) from anon, public;
revoke all on function public.get_admin_session(text) from anon, public;
revoke all on function public.delete_admin_session(text) from anon, public;
revoke all on function public.delete_all_admin_sessions(uuid) from anon, public;
grant execute on function public.create_admin_session(text, uuid, timestamptz) to service_role;
grant execute on function public.get_admin_session(text) to service_role;
grant execute on function public.delete_admin_session(text) to service_role;
grant execute on function public.delete_all_admin_sessions(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 7. Credential update RPC (current admin only, self-service)
-- ---------------------------------------------------------------------------
create or replace function public.update_admin_credentials(
  p_admin_id     uuid,
  p_username     text,
  p_new_password text default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_username text := lower(btrim(coalesce(p_username, '')));
begin
  if v_username = ''
     or length(v_username) < 3
     or length(v_username) > 30
     or v_username !~ '^[a-z0-9_.-]+$' then
    raise exception 'INVALID_USERNAME' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.admin_users
    where lower(username) = v_username and id <> p_admin_id
  ) then
    raise exception 'USERNAME_TAKEN' using errcode = 'P0001';
  end if;

  update public.admin_users
  set username = v_username, updated_at = now()
  where id = p_admin_id;

  if p_new_password is not null and btrim(p_new_password) <> '' then
    if length(p_new_password) < 8 then
      raise exception 'WEAK_PASSWORD' using errcode = 'P0001';
    end if;
    update public.admin_users
    set password_hash = crypt(p_new_password, gen_salt('bf', 10)), updated_at = now()
    where id = p_admin_id;
    -- Changing the password revokes every existing session (re-login required).
    delete from public.admin_sessions where admin_id = p_admin_id;
  end if;
end;
$$;

revoke all on function public.update_admin_credentials(uuid, text, text) from anon, public;
grant execute on function public.update_admin_credentials(uuid, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- 8. Default admin provisioning (fresh-install seed)
-- ---------------------------------------------------------------------------
create or replace function public.ensure_default_admin()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if exists (select 1 from public.admin_users where lower(username) = 'admin123') then
    return;
  end if;

  insert into public.admin_users (username, password_hash, display_name, role, is_active)
  values (
    'admin123',
    crypt('admin123', gen_salt('bf', 10)),
    'Administrator',
    'super_admin',
    true
  );
end;
$$;

revoke all on function public.ensure_default_admin() from anon, public;

-- Run the seed now so the default admin exists immediately after migration.
select public.ensure_default_admin();

-- ---------------------------------------------------------------------------
-- 9. Promote helper (username + password, no Supabase Auth)
-- ---------------------------------------------------------------------------
create or replace function public.promote_admin(
  p_username text,
  p_password text,
  p_role     text default 'admin'
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_username text := lower(btrim(coalesce(p_username, '')));
begin
  if current_user <> 'postgres'
     and (auth.uid() is null or not public.is_admin()) then
    raise exception 'FORBIDDEN';
  end if;

  if v_username = '' or v_username !~ '^[a-z0-9_.-]+$' then
    raise exception 'INVALID_USERNAME';
  end if;

  if exists (select 1 from public.admin_users where lower(username) = v_username) then
    raise exception 'USERNAME_TAKEN';
  end if;

  if p_password is null or length(p_password) < 8 then
    raise exception 'WEAK_PASSWORD';
  end if;

  insert into public.admin_users (username, password_hash, role, is_active)
  values (v_username, crypt(p_password, gen_salt('bf', 10)), p_role, true);
end;
$$;

revoke all on function public.promote_admin(text, text, text) from anon, public;
grant execute on function public.promote_admin(text, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- 10. Cleanup diagnostic helpers from the earlier debugging session
-- ---------------------------------------------------------------------------
drop function if exists public.diag_dump();
drop function if exists public.diag_repro();
