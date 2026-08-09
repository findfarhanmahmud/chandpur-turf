import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createPublicClient } from "@/lib/supabase/public";
import {
  createAdminSession,
  SESSION_COOKIE,
} from "@/lib/admin/session";

export const dynamic = "force-dynamic";

interface AuthenticateRow {
  ok: boolean;
  admin_id: string;
  username: string;
  display_name: string | null;
  role: string;
}

// POST /api/admin/auth/login  { username, password }
// Username + password only, verified against the bcrypt hash in admin_users.
// On success an HttpOnly session cookie is set; no Supabase Auth is involved.
export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", message: "Invalid username or password." },
      { status: 401 },
    );
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", message: "Invalid username or password." },
      { status: 401 },
    );
  }

  // authenticate_admin is a SECURITY DEFINER RPC callable by the anon role
  // (throttled, returns the identity only when the bcrypt hash verifies).
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("authenticate_admin", {
    p_username: username,
    p_password: password,
  });

  if (error) {
    console.error("authenticate_admin RPC failed:", error.message);
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", message: "Invalid username or password." },
      { status: 401 },
    );
  }

  const row = (data as AuthenticateRow[] | null)?.[0];
  if (!row?.ok) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", message: "Invalid username or password." },
      { status: 401 },
    );
  }

  const { token, expiresAt } = await createAdminSession(row.admin_id);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return NextResponse.json({
    ok: true,
    user: {
      username: row.username,
      displayName: row.display_name,
      role: row.role,
    },
  });
}
