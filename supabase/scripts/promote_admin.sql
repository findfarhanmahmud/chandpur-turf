-- ============================================================================
-- Chandpur Turf — Add an Admin (username + password, no Supabase Auth)
-- ============================================================================
-- HOW TO USE
--   1. The DEFAULT admin (username: admin123 / password: admin123) is created
--      automatically by the 0003 migration. No manual setup is required.
--   2. To add MORE admins, run the block below with a username + password.
--      Admins are stored directly in `admin_users` (bcrypt-hashed via
--      pgcrypto); no email or Supabase Auth user is needed.
--
-- SECURITY NOTES
--   - Credentials are never stored plaintext — only a bcrypt hash.
--   - Only the postgres role (SQL Editor / migrations) may run this before any
--     admin exists; afterwards, a current admin can also promote more admins
--     through the same function. There is no public/admin signup path.
--   - Sessions are server-side HttpOnly cookies backed by `admin_sessions`.
-- ============================================================================

-- Add an admin with an explicit username + password (password: min 8 chars):
select public.promote_admin('turfadmin', 'change-me-now', 'admin');

-- Verify
select id, username, role, is_active from public.admin_users;
