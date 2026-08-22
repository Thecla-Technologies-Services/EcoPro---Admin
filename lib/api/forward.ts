import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api/client";
import { getToken, refreshSession } from "@/lib/auth/session";

/**
 * Shared implementation behind the `/api/*` route handlers that forward to the
 * Ecoswap backend with the session's JWT attached server-side, so the token
 * stays in its httpOnly cookie and out of reach of browser scripts.
 *
 * Each service gets its own route file with an explicit prefix — there is no
 * catch-all — so this can never be used as an open proxy to arbitrary hosts.
 */
export async function forwardToApi(
  request: NextRequest,
  /** Upstream prefix, e.g. "/api/admin" or "/api/marketplace". */
  prefix: string,
  segments: string[]
) {
  const token = await getToken();

  if (!token) {
    return unauthorized("Not authenticated.");
  }

  const target = `${API_BASE_URL}${prefix}/${segments
    .map(encodeURIComponent)
    .join("/")}${request.nextUrl.search}`;

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let upstream = await forward(target, request, token, body);

  // An expired JWT is worth one silent retry with a refreshed one.
  if (upstream.status === 401) {
    // Release the rejected response before issuing the retry, otherwise the
    // connection is held open until GC.
    await upstream.body?.cancel();

    // refreshSession() de-dupes concurrent exchanges for the same token.
    // Anything it throws has to become a 401 rather than escaping as a 500: the
    // client can only recognise an expired session from a 401, so a 500 here
    // leaves the query parked in an error state that never signs the admin out
    // and never retries.
    let refreshedToken: string | null = null;

    try {
      refreshedToken = await refreshSession();
    } catch (reason) {
      console.error("[api] token refresh failed", reason);
    }

    if (!refreshedToken) {
      return unauthorized("Your session has expired. Please sign in again.");
    }

    upstream = await forward(target, request, refreshedToken, body);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

/**
 * `statusCode` is spelled out because that is what the client keys its
 * sign-out on; leaving it to be inferred from the HTTP status is one indirection
 * away from a session that fails silently instead of returning to the login
 * screen.
 */
function unauthorized(message: string) {
  return NextResponse.json(
    { isSuccess: false, statusCode: "Unauthorized", message, data: null },
    { status: 401 }
  );
}

function forward(
  target: string,
  request: NextRequest,
  token: string,
  body: ArrayBuffer | undefined
) {
  return fetch(target, {
    method: request.method,
    headers: {
      Accept: request.headers.get("accept") ?? "application/json",
      ...(request.headers.get("content-type") && {
        "Content-Type": request.headers.get("content-type") as string,
      }),
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined && body.byteLength > 0 && { body }),
    cache: "no-store",
  });
}
