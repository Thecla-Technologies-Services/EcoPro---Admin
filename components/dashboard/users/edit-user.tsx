"use client";

import { useRef, useState } from "react";
import { IoPersonOutline } from "react-icons/io5";
import { Camera, Mail, Phone } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editUserSchema, type EditUserForm } from "@/lib/validations/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingSelect } from "@/components/shared/form/floating-select";
import type { User as UserType } from "@/types/user";
import { FloatingPhoneInput } from "@/components/shared/form/floating-phone-input";
import { useUpdateUser } from "@/hooks/admin/use-users";
import { useRoles } from "@/hooks/admin/use-roles";
import { toErrorMessage } from "@/lib/api/errors";

interface EditProfileFormProps {
  user: UserType;
  onSave: () => void;
  onCancel: () => void;
}

export function EditProfileForm({
  user,
  onSave,
  onCancel,
}: EditProfileFormProps) {
  const [avatar, setAvatar] = useState<string | null>(user.avatar ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateUser = useUpdateUser();

  // `roleId` on the API is a GUID, so the role options have to come from
  // /api/admin/roles rather than being hardcoded labels.
  const { data: roleData, isPending: rolesPending } = useRoles({ pageSize: 100 });
  const roles = roleData?.roles?.data ?? [];
  const roleNames = roles.map((role) => role.name ?? "").filter(Boolean);
  const currentRoleName =
    roles.find((role) => role.name === user.role)?.name ?? "";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: user.name.split(" ")[0] ?? "",
      lastName: user.name.split(" ").slice(1).join(" "),
      email: user.email,
      phone: user.phone ?? "",
      accountRole: currentRoleName,
      accountStatus: user.status,
    },
  });

  const onSubmit = (data: EditUserForm) => {
    const roleId = roles.find((role) => role.name === data.accountRole)?.id;

    updateUser.mutate(
      {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        // The record's own address rather than the form's: the field is not
        // editable, so this is the value either way — and taking it from the
        // user means a tampered form still cannot change it.
        email: user.email,
        phoneNumber: data.phone,
        // Omitted rather than sent as null when no role is selected, so the
        // API keeps whatever role the user already has.
        ...(roleId && { roleId }),
        isActive: data.accountStatus === "Active",
      },
      { onSuccess: () => onSave() },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center justify-start gap-4 mb-4">
        {/* Sized explicitly so the badge below positions against the avatar
            box itself rather than whatever the wrapper happens to collapse to. */}
        <div className="relative size-16 shrink-0 md:size-25">
          <Avatar className="size-full">
            <AvatarImage src={avatar ?? undefined} alt={user.name} />
            {/* Kept but empty: it is what paints the grey disc when there is
                no photo, and the camera centred on top is the only mark the
                design wants there. */}
            <AvatarFallback className="bg-muted" />
          </Avatar>
          {/* Centred over the avatar, as the design has it — the whole face is
              the affordance, not a corner badge. */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Change profile image"
            className="absolute top-1/2 left-1/2 z-10 flex size-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full"
          >
            {/* No disc behind it, so the glyph carries a drop shadow — white on
                white is invisible on a light photo. */}
            <Camera className="size-10 text-white drop-shadow-md" />
          </button>
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
        <p className="text-xs text-muted-foreground">Change Profile Image</p>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <FloatingLabelInput
          label="First Name"
          icon={<IoPersonOutline className="size-4" />}
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        <FloatingLabelInput
          label="Last Name"
          icon={<IoPersonOutline className="size-4" />}
          error={errors.lastName?.message}
          {...register("lastName")}
        />
      </div>

      {/* Email — shown so the admin can see which account they are editing,
          but not editable: an email is the account's login, and changing one
          from here would lock the user out with no way back. */}
      <FloatingLabelInput
        label="Email Address"
        type="email"
        icon={<Mail className="size-4" />}
        disabled
        readOnly
        error={errors.email?.message}
        {...register("email")}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <FloatingPhoneInput
            label="Phone Number"
            icon={<Phone className="size-4" />}
            placeholder="Enter phone number"
            value={field.value}
            onChange={field.onChange}
            error={errors.phone?.message}
          />
        )}
      />

      {/* Role */}

      <Controller
        name="accountRole"
        control={control}
        render={({ field }) => (
          <FloatingSelect
            label="Account Role"
            options={roleNames}
            value={field.value}
            onChange={field.onChange}
            disabled={rolesPending}
            error={errors.accountRole?.message}
          />
        )}
      />

      {/* Status */}

      <Controller
        name="accountStatus"
        control={control}
        render={({ field }) => (
          <FloatingSelect
            label="Account Status"
            options={["Active", "Suspended"]}
            value={field.value}
            onChange={field.onChange}
            error={errors.accountStatus?.message}
          />
        )}
      />

      {updateUser.isError && (
        <p role="alert" className="text-sm text-destructive">
          {toErrorMessage(updateUser.error)}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-full"
          onClick={onCancel}
          disabled={updateUser.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 rounded-full bg-primary text-white"
          isLoading={updateUser.isPending}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
