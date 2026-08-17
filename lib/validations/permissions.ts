import { z } from "zod";

/** Role details step — name + description */
export const roleDetailsSchema = z.object({
  name: z.string().trim().min(1, "Role name is required"),
  description: z
    .string()
    .trim()
    .max(280, "Keep it under 280 characters")
    .optional(),
});
export type RoleDetailsValues = z.infer<typeof roleDetailsSchema>;

/** Edit role — same fields as create; permissions are held outside the form */
export const editRoleSchema = roleDetailsSchema;
export type EditRoleValues = z.infer<typeof editRoleSchema>;

/**
 * Delete role — retype the role's own name to confirm.
 *
 * `DeleteRoleRequestDto` carries a `roleName` the API checks against the role
 * being deleted, so the confirmation has to be the name, not a fixed word.
 */
export function makeDeleteRoleSchema(expectedName: string) {
  return z.object({
    confirmName: z
      .string()
      .refine(
        (val) => val.trim().toLowerCase() === expectedName.trim().toLowerCase(),
        { message: "Role name doesn't match" },
      ),
  });
}
export type DeleteRoleValues = { confirmName: string };

/** Delete user — type the user's email to confirm */
export function makeDeleteUserSchema(expectedEmail: string) {
  return z.object({
    confirmEmail: z
      .string()
      .refine(
        (val) => val.trim().toLowerCase() === expectedEmail.toLowerCase(),
        {
          message: "Email doesn't match",
        },
      ),
  });
}
export type DeleteUserValues = { confirmEmail: string };

