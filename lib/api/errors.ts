/**
 * Error thrown when the API answers with `isSuccess: false`.
 *
 * React Query treats a rejected mutation/query as an error state, so unwrapping
 * the envelope into a throw is what lets `isError` / `error.message` work
 * without every component re-checking `isSuccess` itself.
 */
export class ApiError extends Error {
  readonly statusCode: string;
  readonly errorCode: string | null;
  /** Seconds to wait before retrying, when the API rate-limits the request. */
  readonly retryAfterSeconds: number | null;

  constructor(
    message: string,
    statusCode: string,
    errorCode: string | null = null,
    retryAfterSeconds: number | null = null
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * True when the failure means "your session is no longer valid".
 *
 * `statusCode` arrives either as the API's enum name ("Unauthorized") or as a
 * numeric string when we synthesise the failure ourselves, so both are matched.
 */
export function isUnauthorized(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.statusCode === "Unauthorized" || error.statusCode === "401")
  );
}

/**
 * True when the API accepted the identity but refused the action.
 *
 * Matched the same two ways as `isUnauthorized`: the API's enum name, or the
 * numeric string used when we synthesise the failure from a bodiless response.
 */
export function isForbidden(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.statusCode === "Forbidden" || error.statusCode === "403")
  );
}

/** Message to show the user for any thrown value. */
export function toErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
