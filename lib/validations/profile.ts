import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((value) => isValidPhoneNumber(value), {
    message: "Enter a valid phone number",
  });
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),

  // No email: it is the login credential and the OTP destination, so it is
  // read-only on the profile and changed through user management instead.
  phone: phoneNumberSchema,

  /**
   * Editable, but not sent: `AdminEditUserRequestDto` has no address field, so
   * the value is discarded on save. Optional on purpose — an admin whose record
   * carries no address must still be able to save their name and phone.
   */
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
});

export const editUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: phoneNumberSchema,
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  accountRole: z.string().min(1, "Account role is required"),
  accountStatus: z.string().min(1, "Account status is required"),
});

export type EditUserForm = z.infer<typeof editUserSchema>;

export type ProfileFormData = z.infer<typeof profileSchema>;
