import { ApiError } from "@/lib/api/errors";
import type { ApiResponse } from "@/types/auth";

interface FetcherOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /**
   * Which of this app's proxy routes to go through. Defaults to the admin
   * service, which is where nearly every dashboard call belongs; `"user"` is for
   * the few reads the admin service doesn't expose.
   */
  service?: "admin" | "user";
}

/**
 * Client-side entry point for the Ecoswap API.
 *
 * Requests go to this app's own `/api/{service}/*` route, which attaches the JWT
 * from the httpOnly session cookie before forwarding upstream — so the browser
 * never handles the token. Pass the path as it appears in the swagger.
 *
 *   apiFetch<UserDto[]>("/users?page=1")
 *   apiFetch<void>("/users/123/suspend", { method: "POST", body: { reason } })
 *   apiFetch<UserDto[]>("/get-all", { service: "user" })
 *
 * Returns the unwrapped `data` (null for an empty 204-style success) and throws
 * ApiError for anything else, which is what drives React Query's error states.
 */
export async function apiFetch<T>(
  path: string,
  { body, headers, service = "admin", ...init }: FetcherOptions = {}
): Promise<T> {
  const response = await fetch(`/api/${service}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  const text = await response.text();

  // A genuinely empty success (204/205) carries no envelope to unwrap.
  if (!text) {
    if (response.ok) return null as T;
    throw new ApiError(
      `Request failed with status ${response.status}.`,
      String(response.status)
    );
  }

  let payload: ApiResponse<T>;

  try {
    payload = JSON.parse(text) as ApiResponse<T>;
  } catch {
    console.error(
      `[api] /api/${service}${path} returned a non-JSON body`,
      text.slice(0, 500)
    );
    // Surfacing this as an error beats handing back `undefined` and letting a
    // consumer blow up on `data.items` inside a render.
    throw new ApiError(
      "The server returned an unexpected response.",
      String(response.status)
    );
  }

  if (!payload.isSuccess) {
    throw new ApiError(
      payload.message ?? `Request failed with status ${response.status}.`,
      payload.statusCode ?? String(response.status),
      payload.errorCode
    );
  }

  return payload.data;
}
