"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Mail, Lock } from "lucide-react";
import { IoPersonOutline } from "react-icons/io5";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingSelect } from "@/components/shared/form/floating-select";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { phoneNumberSchema } from "@/lib/validations/profile";
import { FloatingPhoneInput } from "@/components/shared/form/floating-phone-input";
import { useCreateUser } from "@/hooks/admin/use-users";
import { useRoles } from "@/hooks/admin/use-roles";
import { toErrorMessage } from "@/lib/api/errors";

const addUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: phoneNumberSchema,
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  verifyEmailAutomatically: z.boolean(),
});

type AddUserForm = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  /** Overrides the heading for a caller creating one kind of account. */
  title?: string;
  /**
   * Pins Account Role, so the dialog can only create that kind of account.
   * Matched case-insensitively against the names /api/admin/roles serves —
   * a role the API does not have blocks the form rather than posting a user
   * with no role.
   */
  lockedRole?: string;
}

export function AddUserDialog({
  open,
  onClose,
  title = "Create New User",
  lockedRole,
}: AddUserDialogProps) {
  const [createdUserCode, setCreatedUserCode] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const createUser = useCreateUser();

  // `roleId` is a GUID, so the options come from /api/admin/roles.
  const { data: roleData, isPending: rolesPending } = useRoles({ pageSize: 100 });
  const roles = roleData?.roles?.data ?? [];
  const roleNames = roles.map((role) => role.name ?? "").filter(Boolean);
  const success = createdUserCode !== null;

  const lockedRoleName = lockedRole
    ? roleNames.find(
        (name) => name.toLowerCase() === lockedRole.toLowerCase(),
      )
    : undefined;
  const lockedRoleMissing =
    Boolean(lockedRole) && !rolesPending && lockedRoleName === undefined;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "",
      verifyEmailAutomatically: true,
    },
  });

  // The roles arrive after the form mounts, and closing resets the field, so the
  // pinned role is written back on each open rather than as a default value.
  useEffect(() => {
    if (open && lockedRoleName) setValue("role", lockedRoleName);
  }, [open, lockedRoleName, setValue]);

  const handleClose = () => {
    reset();
    createUser.reset();
    setCreatedUserCode(null);
    setAvatar(null);
    onClose();
  };

  const onSubmit = (data: AddUserForm) => {
    createUser.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        password: data.password,
        roleId: roles.find((role) => role.name === data.role)?.id,
        verifyEmailAutomatically: data.verifyEmailAutomatically,
      },
      {
        // The response carries the new user's code, which the success dialog
        // shows instead of a hardcoded placeholder.
        onSuccess: (created) =>
          setCreatedUserCode(created?.userCode ?? created?.id ?? ""),
      },
    );
  };

  return (
    <>
      <Dialog open={open && !success} onOpenChange={handleClose}>
        <DialogContent showCloseButton={false} className="max-w-sm gap-0 py-6 px-5">
          <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" />

          <DialogTitle className="text-lg font-semibold mb-5">
            {title}
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Avatar upload */}
            <div className="flex items-center gap-2 mb-4 md:mb-5">
              <div
                className="relative cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <Avatar className="size-25">
                  <AvatarImage src={avatar ?? undefined} />
                  <AvatarFallback className="bg-background">
                    <Camera className="size-7 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setAvatar(URL.createObjectURL(file));
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Profile Image (Optional)
              </p>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <FloatingLabelInput
                label="First Name"
                icon={<IoPersonOutline className="size-4" />}
                {...register("firstName")}
                error={errors.firstName?.message}
              />

              <FloatingLabelInput
                label="Last Name"
                icon={<IoPersonOutline className="size-4" />}
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>

            {/* Email */}

            <FloatingLabelInput
              label="Email Address"
              type="email"
              icon={<Mail className="size-4" />}
              {...register("email")}
              error={errors.email?.message}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <FloatingPhoneInput
                  label="Phone Number"
                  placeholder="Enter phone number"
                  icon={<IoPersonOutline className="size-4" />}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                />
              )}
            />

            {/* Password */}

            <FloatingLabelInput
              label="Create Password"
              type="password"
              icon={<Lock className="size-4" />}
              {...register("password")}
              error={errors.password?.message}
            />

            {/* Role */}

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  label="Account Role"
                  options={lockedRoleName ? [lockedRoleName] : roleNames}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={rolesPending || Boolean(lockedRole)}
                  error={
                    lockedRoleMissing
                      ? `The "${lockedRole}" role was not found`
                      : errors.role?.message
                  }
                />
              )}
            />

            {/* Verify email toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium">
                Verify Email Automatically
              </span>
              <Controller
                name="verifyEmailAutomatically"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-primary"
                  />
                )}
              />
            </div>

            {createUser.isError && (
              <p role="alert" className="text-sm text-destructive">
                {toErrorMessage(createUser.error)}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={handleClose}
                disabled={createUser.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-full bg-primary text-white"
                isLoading={createUser.isPending}
                disabled={lockedRoleMissing}
              >
                Create User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success */}
      <ConfirmActionDialog
        open={success}
        onOpenChange={handleClose}
        title="User Created Successfully"
        description={
          createdUserCode
            ? `User created successfully with the User ID: ${createdUserCode}`
            : "User created successfully."
        }
        iconClassName="text-primary"
      >
        <Button
          className="w-full rounded-full bg-primary text-white"
          onClick={handleClose}
        >
          Done
        </Button>
      </ConfirmActionDialog>
    </>
  );
}
