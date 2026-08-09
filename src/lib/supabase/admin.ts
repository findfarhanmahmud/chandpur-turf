import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-only Supabase client using the service role. Bypasses RLS (the
// service role is trusted by the database) and is NEVER used in client
// components — every call site is gated behind requireAdminApi/requireAdmin
// which verify the HttpOnly session cookie first. Public/anonymous access is
// unaffected and still goes through the RLS-protected anon client.
export function createAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
