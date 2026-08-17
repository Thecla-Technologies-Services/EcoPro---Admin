"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  login,
  logout,
  resendOtp,
  verifyOtp,
  type ActionResult,
} from "@/app/actions/auth";
import { ApiError } from "@/lib/api/errors";
import type { LoginFormData, VerifyOtpFormData } from "@/lib/validations/auth";

/** Where an authenticated admin lands. */
const DASHBOARD_ROUTE = "/overview";
const LOGIN_ROUTE = "/";
const VERIFY_OTP_ROUTE = "/verify-otp";

/**
 * Server Actions report failures by returning them; React Query reports them by
 * rejecting. This bridges the two so `mutation.error` carries the API's own
 * message.
 */
function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) {
    throw new ApiError(result.error, "BadRequest", null, result.retryAfterSeconds);
  }
  return result.data;
}

/** Step 1 of login: credentials in, OTP dispatched. */
export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (credentials: LoginFormData) =>
      unwrap(await login(credentials)),
    onSuccess: ({ requiresOtp }) => {
      router.push(requiresOtp ? VERIFY_OTP_ROUTE : DASHBOARD_ROUTE);

      // When the API skipped the OTP step it already returned a token, so the
      // session cookies are set and the server-rendered shell has to re-render
      // with the signed-in admin.
      if (!requiresOtp) router.refresh();
    },
  });
}

/** Step 2 of login: OTP in, session cookies set. */
export function useVerifyOtp() {
  const router = useRouter();

  return useMutation({
    mutationKey: ["auth", "verify-otp"],
    mutationFn: async (values: VerifyOtpFormData) => unwrap(await verifyOtp(values)),
    onSuccess: () => {
      router.push(DASHBOARD_ROUTE);
      // The dashboard layout reads the session cookie on the server, so the
      // shell has to re-render with the freshly signed-in admin.
      router.refresh();
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationKey: ["auth", "resend-otp"],
    mutationFn: async () => unwrap(await resendOtp()),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: async () => unwrap(await logout()),
    onSettled: () => {
      // Drop every cached admin response so the next session can't read the
      // previous admin's data out of the cache.
      queryClient.clear();
      router.push(LOGIN_ROUTE);
      router.refresh();
    },
  });
}
