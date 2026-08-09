import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminSession } from "@/types/admin";

export const SESSION_COOKIE = "ct_admin_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Only the sha256 of the token is stored server-side (admin_sessions).
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

// Resolves the admin identity for the request's session cookie, or null when
// the cookie is missing, expired, or the admin was deactivated.
export async function readAdminSession(): Promise<AdminSession | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_admin_session", {
    p_token_hash: hashToken(token),
  });

  if (error || !Array.isArray(data) || data.length === 0) return null;
  const row = data[0] as {
    admin_id: string;
    username: string;
    display_name: string | null;
    role: string;
  };
  return {
    userId: row.admin_id,
    username: row.username,
    displayName: row.display_name,
    role: row.role === "super_admin" ? "super_admin" : "admin",
  };
}

// Persists a new server-side session and returns the raw token to store in the
// HttpOnly cookie (only its hash is written to the database).
export async function createAdminSession(
  adminId: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("create_admin_session", {
    p_token_hash: hashToken(token),
    p_admin_id: adminId,
    p_expires_at: expiresAt.toISOString(),
  });
  if (error) throw error;

  return { token, expiresAt };
}

// Invalidates the current session server-side (called on sign-out).
export async function destroyAdminSession(): Promise<void> {
  const token = await getSessionToken();
  if (!token) return;
  const supabase = createAdminClient();
  await supabase.rpc("delete_admin_session", {
    p_token_hash: hashToken(token),
  });
}
