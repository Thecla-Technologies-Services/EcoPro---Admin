import type { ApiResponse } from "@/types/auth";

export const API_BASE_URL =
  process.env.ECOSWAP_API_URL ?? "https://ecopro.runasp.net";

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Bearer token to send with the request. */
  token?: string;
}

/**
 * Calls the Ecoswap API and normalises the result into an ApiResponse.
 *
 * The API answers with the same envelope on 4xx as it does on 200, so callers
 * only ever have to look at `isSuccess`. Transport failures and non-JSON
 * responses (e.g. an HTML 500 page) are folded into the same shape rather than
 * thrown, so a form can always show the user something specific.
 */
export async function apiRequest<T>(
  path: string,
  { body, token, headers, ...init }: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
      cache: "no-store",
    });
  } catch (reason) {
    console.error(`[api] ${path} request failed`, reason);
    return failure("Could not reach the server. Check your connection and try again.");
  }

  const text = await response.text();

  if (!text) {
    return {
      ...failure(
        response.ok ? null : `Request failed with status ${response.status}.`,
        response.status
      ),
      isSuccess: response.ok,
    };
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    console.error(`[api] ${path} returned a non-JSON body`, text.slice(0, 500));
    return failure(
      response.ok
        ? "The server returned an unexpected response."
        : `Request failed with status ${response.status}.`,
      response.status
    );
  }
}

function failure(message: string | null, statusCode?: number): ApiResponse<never> {
  return {
    isSuccess: false,
    errorCode: null,
    statusCode: statusCode ? String(statusCode) : "InternalServerError",
    message,
    devMessage: null,
    data: null as never,
  };
}
