-- ============================================================================
-- Chandpur Turf — Fix ambiguous column references in authenticate_admin
--
-- The RETURNS TABLE column `username` collides with public.admin_users.username
-- inside the function body, so unqualified `username` / `is_active` references
-- are ambiguous (SQLSTATE 42702). All references are now alias-qualified.
-- ============================================================================

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
  delete from public.admin_login_attempts la
  where la.attempted_at < now() - interval '15 minutes';

  select a.* into v_admin
  from public.admin_users a
  where lower(a.username) = v_username and a.is_active;

  if v_admin.id is not null then
    select count(*) into v_failures
    from public.admin_login_attempts la
    where la.username = v_username;

    if v_failures >= 10 then
      return query select false, null::uuid, null::text, null::text, null::text;
      return;
    end if;

    if v_admin.password_hash is not null
       and crypt(p_password, v_admin.password_hash) = v_admin.password_hash then
      delete from public.admin_login_attempts la where la.username = v_username;
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
