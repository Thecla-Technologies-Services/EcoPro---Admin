"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { FloatingLabelInput } from "../shared/floating-label-input";
import { Button } from "@/components/ui/button";
import { useResendOtp, useVerifyOtp } from "@/hooks/auth/use-auth-mutations";
import { ApiError, toErrorMessage } from "@/lib/api/errors";
import {
  OTP_LENGTH,
  verifyOtpSchema,
  type VerifyOtpFormData,
} from "@/lib/validations/auth";

/** Seconds to wait before another code can be requested. */
const RESEND_COOLDOWN_SECONDS = 60;

export function OtpForm() {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: "" },
  });

  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onResend = () => {
    verifyMutation.reset();
    resendMutation.mutate(undefined, {
      // Only a code that actually went out starts the cooldown — otherwise a
      // failed resend would lock the button for a minute with nothing sent.
      // The API may ask for a longer wait than our default; honour it if so.
      onSuccess: (data) =>
        setCooldown(data.retryAfterSeconds ?? RESEND_COOLDOWN_SECONDS),
      // A rate-limited resend (429) still tells us how long to wait; anything
      // else frees the button immediately so the admin can retry.
      onError: (error) =>
        setCooldown(error instanceof ApiError ? (error.retryAfterSeconds ?? 0) : 0),
    });
  };

  const errorMessage = verifyMutation.isError
    ? toErrorMessage(verifyMutation.error)
    : resendMutation.isError
      ? toErrorMessage(resendMutation.error)
      : null;

  return (
    <form
      onSubmit={handleSubmit((data) => verifyMutation.mutate(data))}
      className="space-y-4"
    >
      <div>
        <FloatingLabelInput
          label="Verification Code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          autoFocus
          icon={<ShieldCheck className="size-5" />}
          {...register("code")}
        />
        {errors.code && (
          <p className="mt-1 text-sm text-destructive">{errors.code.message}</p>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      {resendMutation.isSuccess && !resendMutation.isPending && (
        <p className="text-sm text-primary">
          We&apos;ve sent a new code to your email.
        </p>
      )}

      <Button
        type="submit"
        // Stays busy through the redirect that follows a successful login.
        isLoading={verifyMutation.isPending || verifyMutation.isSuccess}
        className="w-full h-10 md:h-10.5 rounded-full bg-primary hover:bg-[#2d442d] text-white"
      >
        Verify
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Didn&apos;t get the code?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || resendMutation.isPending}
          className="font-medium text-primary underline-offset-4 hover:underline disabled:no-underline disabled:opacity-60"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}
