import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api/client";
import type { AdminSession, AuthResponseDto } from "@/types/auth";

export const TOKEN_COOKIE = "ecoswap_token";
export const REFRESH_TOKEN_COOKIE = "ecoswap_refresh_token";
export const SESSION_COOKIE = "ecoswap_session";
export const PERMISSIONS_COOKIE = "ecoswap_permissions";
/** Holds the email between the credentials step and the OTP step. */
export const PENDING_LOGIN_COOKIE = "ecoswap_pending_login";

const DEFAULT_SESSION_DAYS = 7;
const PENDING_LOGIN_MINUTES = 15;
/**
 * Browsers cap a single cookie at roughly 4KB and drop anything larger without
 * telling us. We stay well under that so an oversized permission list can never
 * silently take a cookie with it.
 */
const MAX_COOKIE_BYTES = 3500;

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Profile fields kept in the session cookie, minus the permission list. */
type SessionCookiePayload = Omit<AdminSession, "permissions">;

function toSessionPayload(auth: AuthResponseDto): SessionCookiePayload {
  return {
    userId: auth.userId,
    firstName: auth.firstName,
    lastName: auth.lastName,
    email: auth.email,
    role: auth.role,
    profilePictureUrl: auth.profilePictureUrl,
    mustChangePassword: auth.mustChangePassword,
  };
}

/**
 * Resolves the session lifetime from the API's refresh-token expiry.
 *
 * The value is treated defensively: an unparseable or already-expired timestamp
 * would otherwise produce a cookie the browser refuses to store, which looks to
 * the admin like a login that silently bounces back to the sign-in screen.
 */
function resolveSessionExpiry(refreshTokenExpiryTime: string | null): Date {
  const fallback = new Date(
    Date.now() + DEFAULT_SESSION_DAYS * 24 * 60 * 60 * 1000
  );

  if (!refreshTokenExpiryTime) return fallback;

  // The API can return a timestamp with no zone designator, which JS would read
  // as *this server's* local time and expire the session early. Assume UTC.
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(refreshTokenExpiryTime);
  const parsed = new Date(hasTimezone ? refreshTokenExpiryTime : `${refreshTokenExpiryTime}Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
    console.warn(
      `[auth] unusable refreshTokenExpiryTime (${refreshTokenExpiryTime}); falling back to ${DEFAULT_SESSION_DAYS} days`
    );
    return fallback;
  }

  return parsed;
}

/**
 * Persists an authenticated session. The JWT and refresh token go into
 * httpOnly cookies so client-side scripts can never read them; only the
 * non-sensitive profile fields are stored for rendering.
 */
export async function createSession(auth: AuthResponseDto) {
  if (!auth.token) {
    throw new Error("Cannot create a session without a token");
  }

  const expires = resolveSessionExpiry(auth.refreshTokenExpiryTime);
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE, auth.token, { ...baseCookieOptions, expires });

  if (auth.refreshToken) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, auth.refreshToken, {
      ...baseCookieOptions,
      expires,
    });
  } else {
    // A session with no refresh token is a dead end: it works until the JWT
    // expires and then every request 401s with nothing to exchange. Say so at
    // sign-in rather than letting it surface as a random mid-session stall.
    console.warn(
      "[auth] sign-in returned no refreshToken; this session cannot be refreshed"
    );
  }

  cookieStore.set(SESSION_COOKIE, JSON.stringify(toSessionPayload(auth)), {
    ...baseCookieOptions,
    expires,
  });

  // Permissions live in their own cookie so a long list can't push the profile
  // cookie over the browser's size limit and take the whole session with it.
  const permissions = JSON.stringify(auth.permissions ?? []);

  if (permissions.length > MAX_COOKIE_BYTES) {
    console.warn(
      `[auth] permission list too large for a cookie (${permissions.length} bytes); permissions will read as empty`
    );
    cookieStore.delete(PERMISSIONS_COOKIE);
    return;
  }

  cookieStore.set(PERMISSIONS_COOKIE, permissions, {
    ...baseCookieOptions,
    expires,
  });
}

/**
 * Rewrites the session cookies after a refresh.
 *
 * Deliberately not `createSession`: the refresh endpoint is only contracted to
 * return a token pair, so a response that omits the profile fields must leave
 * the ones we already hold alone rather than blanking the admin's name, role
 * and permissions halfway through the day.
 */
async function updateSessionTokens(auth: AuthResponseDto, token: string) {
  const expires = resolveSessionExpiry(auth.refreshTokenExpiryTime);
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE, token, { ...baseCookieOptions, expires });

  // Rotation is upstream's choice; keep the existing token when none comes back.
  if (auth.refreshToken) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, auth.refreshToken, {
      ...baseCookieOptions,
      expires,
    });
  }

  // Take the refreshed profile when there is one, otherwise re-stamp what we
  // hold so these cookies never outlive — or die before — their tokens.
  const profile = auth.email
    ? JSON.stringify(toSessionPayload(auth))
    : cookieStore.get(SESSION_COOKIE)?.value;

  if (profile) {
    cookieStore.set(SESSION_COOKIE, profile, { ...baseCookieOptions, expires });
  }

  const permissions = auth.permissions
    ? JSON.stringify(auth.permissions)
    : cookieStore.get(PERMISSIONS_COOKIE)?.value;

  if (permissions && permissions.length <= MAX_COOKIE_BYTES) {
    cookieStore.set(PERMISSIONS_COOKIE, permissions, {
      ...baseCookieOptions,
      expires,
    });
  }
}

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

/** The signed-in admin, or null when there is no usable session. */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();

  if (!cookieStore.get(TOKEN_COOKIE)?.value) return null;

  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as SessionCookiePayload;
    return { ...payload, permissions: readPermissions(cookieStore) };
  } catch {
    return null;
  }
}

function readPermissions(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): string[] {
  const raw = cookieStore.get(PERMISSIONS_COOKIE)?.value;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  for (const name of [
    TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    SESSION_COOKIE,
    PERMISSIONS_COOKIE,
  ]) {
    cookieStore.delete(name);
  }
}

/**
 * In-flight refresh exchanges, keyed by the refresh token being spent.
 *
 * Concurrent requests that hit an expired JWT must not each spend the refresh
 * token: with rotation upstream only the first exchange succeeds and the losers
 * would tear down the session that was just refreshed. Keying by token means
 * two different admins served by this instance never share a result. This
 * de-dupes within one server process, which is where the burst originates.
 *
 * The cached value is the API response only — never a cookie write. See
 * `refreshSession`.
 */
const pendingRefreshes = new Map<string, Promise<AuthResponseDto | null>>();

/**
 * Exchanges the refresh token for a new JWT. Returns the new token, or null if
 * the refresh token is missing or no longer accepted — in which case the caller
 * should treat the admin as signed out.
 */
export async function refreshSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  // A token cookie with no refresh cookie beside it is unrecoverable. Leaving
  // it in place is what strands the dashboard: the proxy gate keeps admitting
  // the request, and every API call 401s until someone signs out by hand.
  if (!accessToken || !refreshToken) {
    await deleteSession();
    return null;
  }

  let exchange = pendingRefreshes.get(refreshToken);

  if (!exchange) {
    exchange = exchangeRefreshToken(accessToken, refreshToken).finally(() => {
      pendingRefreshes.delete(refreshToken);
    });
    pendingRefreshes.set(refreshToken, exchange);
  }

  const auth = await exchange;

  // Only the *response* is shared. The cookie writes happen here, per caller,
  // because `cookies()` resolves against the request that is running now: were
  // they done inside the shared promise they would land on the response of
  // whichever request happened to start the exchange, and every other request —
  // and the browser, if that one request is cancelled — would be left holding a
  // refresh token upstream has already rotated away.
  if (!auth?.token) {
    await deleteSession();
    return null;
  }

  await updateSessionTokens(auth, auth.token);
  return auth.token;
}

/**
 * The bare exchange: no cookie writes, so the result is safe to share between
 * concurrent callers. Returns null when the refresh token is no longer accepted.
 */
async function exchangeRefreshToken(
  accessToken: string,
  refreshToken: string
): Promise<AuthResponseDto | null> {
  const result = await apiRequest<AuthResponseDto>("/api/auth/refresh-token", {
    method: "POST",
    body: { accessToken, refreshToken },
  });

  if (!result.isSuccess || !result.data?.token) {
    console.warn(`[auth] refresh rejected: ${result.message ?? "no token returned"}`);
    return null;
  }

  return result.data;
}

export async function setPendingLoginEmail(email: string) {
  (await cookies()).set(PENDING_LOGIN_COOKIE, email, {
    ...baseCookieOptions,
    expires: new Date(Date.now() + PENDING_LOGIN_MINUTES * 60 * 1000),
  });
}

export async function getPendingLoginEmail() {
  return (await cookies()).get(PENDING_LOGIN_COOKIE)?.value ?? null;
}

export async function clearPendingLoginEmail() {
  (await cookies()).delete(PENDING_LOGIN_COOKIE);
}
