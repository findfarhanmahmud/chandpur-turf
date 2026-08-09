import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATH = "/admin";
const LOGIN_PATH = "/admin/login";
const SESSION_COOKIE = "ct_admin_session";

// Optimistic session check only (cookie presence). Authoritative checks happen
// in every admin Server Component and route handler via requireAdmin() /
// requireAdminApi(), backed by the admin_sessions store.
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => c.name === SESSION_COOKIE);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === LOGIN_PATH;
  const isAdminRoute =
    pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);

  if (isLoginRoute && hasSessionCookie(request)) {
    return NextResponse.redirect(new URL(ADMIN_PATH, request.url));
  }

  if (isAdminRoute && !isLoginRoute && !hasSessionCookie(request)) {
    const login = new URL(LOGIN_PATH, request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
