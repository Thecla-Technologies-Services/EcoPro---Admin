"use server";

import { apiRequest } from "@/lib/api/client";
import {
  clearPendingLoginEmail,
  createSession,
  deleteSession,
  getPendingLoginEmail,
  getToken,
  setPendingLoginEmail,
} from "@/lib/auth/session";
import { loginSchema, verifyOtpSchema } from "@/lib/validations/auth";
import type { AuthResponseDto, OtpSendResult } from "@/types/auth";

/**
 * These actions exist because only the server can write the httpOnly session
 * cookies. They deliberately *return* failures rather than throwing or
 * redirecting: Next redacts thrown Server Action messages in production, and a
 * `redirect()` would reach React Query as a NEXT_REDIRECT error. The client
 * hooks in `hooks/auth/` turn a returned failure into a throw so React Query's
 * error state stays meaningful, and handle navigation on success.
 */

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      /** Present when the API rate-limited the request (HTTP 429). */
      retryAfterSeconds?: number | null;
    };

/** Set when the credentials were accepted but the OTP step is still required. */
export type LoginOutcome = { requiresOtp: boolean };

/** Step 1: verify email + password. On success the API emails an OTP. */
export async function login(input: unknown): Promise<ActionResult<LoginOutcome>> {
  const fields = loginSchema.safeParse(input);

  if (!fields.success) {
    return { ok: false, error: "Enter a valid email address and password." };
  }

  const { email, password } = fields.data;
  const result = await apiRequest<AuthResponseDto>("/api/admin/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (!result.isSuccess) {
    return {
      ok: false,
      error: result.message ?? "We couldn't sign you in. Please try again.",
    };
  }

  // The API normally withholds the token until the OTP is verified, but honour
  // it if a token does come back so the second step isn't a dead end.
  if (result.data?.token) {
    await createSession(result.data);
    await clearPendingLoginEmail();
    return { ok: true, data: { requiresOtp: false } };
  }

  await setPendingLoginEmail(email);
  return { ok: true, data: { requiresOtp: true } };
}

/** Step 2: exchange the emailed OTP for a session. */
export async function verifyOtp(input: unknown): Promise<ActionResult> {
  const fields = verifyOtpSchema.safeParse(input);

  if (!fields.success) {
    return {
      ok: false,
      error: fields.error.issues[0]?.message ?? "Invalid verification code.",
    };
  }

  const email = await getPendingLoginEmail();

  if (!email) {
    return { ok: false, error: "Your login session expired. Please sign in again." };
  }

  const result = await apiRequest<AuthResponseDto>("/api/admin/auth/verify-otp", {
    method: "POST",
    body: { email, code: fields.data.code },
  });

  if (!result.isSuccess || !result.data?.token) {
    return {
      ok: false,
      error:
        result.message ?? "That code isn't valid. Request a new one and try again.",
    };
  }

  await createSession(result.data);
  await clearPendingLoginEmail();
  return { ok: true, data: null };
}

/** Seconds the API wants us to wait before another code can be requested. */
export type ResendOutcome = { retryAfterSeconds: number | null };

export async function resendOtp(): Promise<ActionResult<ResendOutcome>> {
  const email = await getPendingLoginEmail();

  if (!email) {
    return { ok: false, error: "Your login session expired. Please sign in again." };
  }

  const result = await apiRequest<OtpSendResult>("/api/admin/auth/resend-otp", {
    method: "POST",
    body: { email },
  });

  if (!result.isSuccess || result.data?.success === false) {
    return {
      ok: false,
      error:
        result.data?.error ??
        result.message ??
        "We couldn't resend the code. Please try again shortly.",
      // A 429 tells us how long to wait; pass it on so the UI can hold the
      // button rather than letting the admin hammer a rate-limited endpoint.
      retryAfterSeconds: result.data?.retryAfterSeconds ?? null,
    };
  }

  return { ok: true, data: { retryAfterSeconds: result.data?.retryAfterSeconds ?? null } };
}

export async function logout(): Promise<ActionResult> {
  const token = await getToken();

  // Best effort: let the API invalidate the refresh token. A failure here must
  // not stop us clearing the cookies locally.
  if (token) {
    const result = await apiRequest("/api/auth/logout", { method: "POST", token });
    if (!result.isSuccess) {
      console.warn("[auth] remote logout failed:", result.message);
    }
  }

  await deleteSession();
  await clearPendingLoginEmail();
  return { ok: true, data: null };
}
