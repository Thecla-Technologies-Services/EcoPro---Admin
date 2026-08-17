import { NextResponse, type NextRequest } from "next/server";
import {
  PENDING_LOGIN_COOKIE,
  SESSION_COOKIE,
  TOKEN_COOKIE,
} from "@/lib/auth/session";

const LOGIN_ROUTE = "/";
const VERIFY_OTP_ROUTE = "/verify-otp";
const DASHBOARD_ROUTE = "/overview";

/** Routes reachable without a session. Everything else requires one. */
const PUBLIC_ROUTES = [LOGIN_ROUTE, VERIFY_OTP_ROUTE];

/**
 * Optimistic auth gate: it only looks at cookies, never at the API, so it stays
 * cheap enough to run on every request (including prefetches). Server Actions
 * and the /api/admin proxy do the authoritative checks.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isSignedIn = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (!isPublicRoute && !isSignedIn) {
    const loginUrl = new URL(LOGIN_ROUTE, request.nextUrl);
    return clearSession(NextResponse.redirect(loginUrl));
  }

  if (isSignedIn && isPublicRoute) {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.nextUrl));
  }

  // The OTP screen is only meaningful right after the credentials step.
  if (
    pathname === VERIFY_OTP_ROUTE &&
    !request.cookies.get(PENDING_LOGIN_COOKIE)?.value
  ) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.nextUrl));
  }

  return NextResponse.next();
}

/** Drops a stale session cookie so the login screen starts clean. */
function clearSession(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  // Excludes only the API and known static paths. A blanket `.*\.\w+$` rule
  // would also skip any route whose segment contains a dot (e.g. an id like
  // `some.id`), leaving it ungated.
  matcher: [
    "/((?!api/|_next/static/|_next/image|assets/|favicon.ico|.*\\.svg$).*)",
  ],
};
