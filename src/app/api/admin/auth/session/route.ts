import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminSession } from "@/lib/admin/auth";
import {
  destroyAdminSession,
  SESSION_COOKIE,
} from "@/lib/admin/session";

export const dynamic = "force-dynamic";

// Returns the current admin session (or null) for client-side checks.
export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({ session });
}

// Sign out: revokes the session server-side and clears the HttpOnly cookie.
export async function DELETE() {
  await destroyAdminSession();
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
