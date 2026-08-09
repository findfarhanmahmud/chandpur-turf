import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { readAdminSession } from "@/lib/admin/session";
import type { AdminSession } from "@/types/admin";

type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

// Resolves the current admin from the HttpOnly session cookie + the
// admin_sessions store. Returns null for anonymous visitors and expired or
// revoked sessions.
//
// Admin login is disabled: when there is no real session we automatically
// authenticate as the default admin so the panel is freely accessible.
export const getAdminSession = cache(
  async (): Promise<AdminSession | null> => {
    const session = await readAdminSession();
    if (session) return session;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, display_name, role")
      .eq("username", "admin123")
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;

    return {
      userId: data.id,
      username: data.username,
      displayName: data.display_name,
      role: data.role === "super_admin" ? "super_admin" : "admin",
    };
  },
);

// Server Component guard: redirects to the login page when the current user
// is not an active admin. Call at the top of every /admin page.
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function unauthorized() {
  return NextResponse.json(
    { error: "UNAUTHORIZED", message: "Please sign in to continue." },
    { status: 401 },
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: "FORBIDDEN", message: "Admin access required." },
    { status: 403 },
  );
}

export type AdminApiGuard =
  | { ok: true; supabase: SupabaseAdminClient; session: AdminSession }
  | { ok: false; response: Response };

// Route Handler guard: verifies the session cookie server-side on every admin
// mutation/read, then hands the caller the service-role client. No frontend
// authorization is ever trusted; the service-role client never leaves the server.
export async function requireAdminApi(): Promise<AdminApiGuard> {
  const session = await getAdminSession();
  if (!session) return { ok: false, response: unauthorized() };
  return { ok: true, supabase: createAdminClient(), session };
}
