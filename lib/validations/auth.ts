import { z } from "zod";

export const OTP_LENGTH = 6;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const verifyOtpSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .length(OTP_LENGTH, `Enter the ${OTP_LENGTH}-digit code sent to your email`)
    .regex(/^\d+$/, "The code contains digits only"),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
