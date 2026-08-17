import z from "zod";

export const ecoSchema = z.object({
  pointsPerItem: z.coerce.number().min(1, "Must be at least 1"),
  pointsPerKg: z.coerce.number().min(1, "Must be at least 1"),
  redemptionThreshold: z.coerce.number().min(100, "Must be at least 100"),
});

export const payoutSchema = z.object({
  autoWithdrawals: z.boolean(),
  manualThreshold: z.coerce.number().min(1000, "Minimum threshold is ₦1,000"),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const processingSchema = z.object({
  feeType: z.enum(["percentage", "flat"]),
  processingFee: z.coerce.number().min(0),
  capMaxFee: z.boolean(),
  maxFeeAmount: z.coerce.number().min(0),
  swapFee: z.coerce.number().min(0),
  testItemPrice: z.coerce.number().min(0),
});

export type EcoForm = z.infer<typeof ecoSchema>;
export type PayoutForm = z.infer<typeof payoutSchema>;
export type PasswordForm = z.infer<typeof passwordSchema>;
export type ProcessingForm = z.infer<typeof processingSchema>;