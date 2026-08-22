"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { IoPersonOutline } from "react-icons/io5";
import { Camera, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FloatingLabelInput } from "@/components/shared/floating-label-input";
import { FloatingPhoneInput } from "@/components/shared/floating-phone-input";
import { QueryError } from "@/components/shared/query-error";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";
import { useUpdateUser, useUser } from "@/hooks/admin/use-users";
import { useUserDirectory } from "@/hooks/admin/use-admin-users";
import { toLocation, toRoleLabel } from "@/lib/adapters/user";
import { toErrorMessage } from "@/lib/api/errors";
import type { AdminSession } from "@/types/auth";

/** First letter of each word — the fallback when no picture was uploaded. */
function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A"
  );
}

/** One read-only fact tile. */
function Fact({
  label,
  value,
  icon,
  loading,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
  /** Parenthesised note after the label, e.g. why a field cannot be edited. */
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="mb-1 text-xs leading-none text-muted-foreground">
          {label}
          {hint && <span className="ml-1 opacity-70">({hint})</span>}
        </p>
        {loading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <p className="truncate text-sm font-medium text-foreground">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}

const ACCEPTED_IMAGES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PICTURE_BYTES = 5 * 1024 * 1024;

/**
 * Holds the picked profile picture and its preview.
 *
 * The chosen `file` is kept even though nothing sends it: no admin endpoint
 * accepts an avatar — there is no `profilePictureKey` on any write DTO and
 * `apiFetch` only speaks JSON — so this is the one piece a future upload needs
 * and the rest of the flow is already here. Validation is done up front so a
 * wrong file is refused now rather than at whatever endpoint eventually lands.
 */
function usePicturePicker() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // An object URL is held by the document until revoked, so the previous one is
  // released whenever it is replaced and on unmount.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const select = (next: File | undefined) => {
    if (!next) return;

    if (!ACCEPTED_IMAGES.includes(next.type)) {
      setError("Choose a JPEG, PNG or WebP image.");
      return;
    }

    if (next.size > MAX_PICTURE_BYTES) {
      setError("Choose an image under 5MB.");
      return;
    }

    setError(null);
    setFile(next);
    setPreview(URL.createObjectURL(next));
  };

  return { preview, file, error, select };
}

export function ProfileCard({ session }: { session: AdminSession | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const picture = usePicturePicker();

  const user = useUser(session?.userId);
  const updateUser = useUpdateUser();
  /**
   * Location lives only on the identity service's record — the admin detail
   * response carries no address — so it is read from the directory and matched
   * by id. That list is already cached by the pages that use it.
   */
  const directory = useUserDirectory();

  const details = user.data;
  const location = toLocation(
    directory.data?.find((entry) => entry.id === session?.userId),
  );

  /**
   * The session cookie already carries the admin's own name, email and picture,
   * so it renders the card immediately and the fetched record fills in over it.
   * Without this the page would flash a skeleton for data the browser already
   * had.
   */
  const firstName = details?.firstName ?? session?.firstName ?? "";
  const lastName = details?.lastName ?? session?.lastName ?? "";
  const email = details?.email ?? session?.email ?? "";
  const phone = details?.phoneNumber ?? "";
  const avatarUrl = details?.profilePictureUrl ?? session?.profilePictureUrl;
  const fullName =
    details?.name || [firstName, lastName].filter(Boolean).join(" ") || "Admin";
  const role = toRoleLabel(details?.accountRole ?? session?.role);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName, lastName, phone, location },
  });

  // The record arrives after the first render, so the form is re-seeded once it
  // lands. Without this an admin could open the form on session-only values and
  // save a blank phone number over the real one.
  useEffect(() => {
    reset({ firstName, lastName, phone, location });
  }, [reset, firstName, lastName, phone, location]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.userId) return;

    await updateUser.mutateAsync({
      userId: session.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phone,
      // `data.location` is deliberately not sent: `AdminEditUserRequestDto` has
      // no address field. It is editable by request, but the API drops it, so
      // the value reverts to the directory's on the next read.
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    reset({ firstName, lastName, phone, location });
    updateUser.reset();
    setIsEditing(false);
  };

  if (user.isError) {
    return (
      <QueryError
        error={user.error}
        onRetry={() => user.refetch()}
        className="w-full max-w-3xl"
      />
    );
  }

  // Only a genuinely unknown admin gets placeholders — with a session in hand
  // there is already enough to render.
  const isBlank = user.isPending && !session;

  return (
    <div className="grid w-full max-w-3xl gap-4 rounded-2xl bg-background md:gap-9">
      <div className="flex flex-col gap-2 md:gap-3">
        <div className="h-24 rounded-t-2xl bg-muted" />

        <div className="px-4 md:ml-4">
          <div className="relative -mt-16 w-fit">
            <Avatar className="size-24 border-4 border-white">
              <AvatarImage src={picture.preview ?? avatarUrl ?? undefined} alt={fullName} />
              <AvatarFallback className="bg-muted text-2xl font-semibold text-muted-foreground">
                {initials(fullName)}
              </AvatarFallback>
            </Avatar>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Change profile picture"
              className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
            >
              <Camera className="size-4" />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_IMAGES.join(",")}
              className="hidden"
              onChange={(event) => {
                picture.select(event.target.files?.[0]);
                // Clear the input so re-picking the same file fires onChange.
                event.target.value = "";
              }}
            />
          </div>

          {picture.error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {picture.error}
            </p>
          )}

          {/* No endpoint accepts an avatar yet, so be explicit that the new
              image is a preview only — silently reverting on the next load
              would read as a failed save. */}
          {picture.preview && !picture.error && (
            <p className="mt-2 text-xs text-muted-foreground">
              Preview only — uploading a picture isn&apos;t supported by the API
              yet.
            </p>
          )}
        </div>

        <div className="flex w-full items-center justify-between px-4">
          <div className="flex flex-col gap-2">
            {isBlank ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <h2 className="text-2xl font-bold text-foreground">{fullName}</h2>
            )}
            <Badge className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              {role}
            </Badge>
          </div>

          {!isEditing && (
            <Button
              type="button"
              disabled={!session?.userId}
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 pb-6 md:px-8 md:pb-10">
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Personal Information
        </h3>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FloatingLabelInput
                label="First Name"
                icon={
                  <IoPersonOutline className="size-4 text-muted-foreground" />
                }
                {...register("firstName")}
                error={errors.firstName?.message}
              />

              <FloatingLabelInput
                label="Last Name"
                error={errors.lastName?.message}
                icon={
                  <IoPersonOutline className="size-4 text-muted-foreground" />
                }
                {...register("lastName")}
              />

              {/* Read-only on purpose: the address is the login credential —
                  `POST /auth/login` takes it and the OTP is sent to it — so a
                  typo here would lock the admin out of their own account. It has
                  no verification flow behind this endpoint either. Changing it
                  belongs in user management, or a confirm-by-email flow. */}
              <Fact
                label="Email Address"
                value={email}
                icon={<Mail className="size-4" />}
                loading={isBlank}
              />

              <div>
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
              </div>

              <FloatingLabelInput
                label="Location"
                error={errors.location?.message}
                icon={<MapPin className="size-4 text-muted-foreground" />}
                {...register("location")}
              />
            </div>

            {/* A failed save must not close the form and read as success — the
                values stay put with the API's own message above them. */}
            {updateUser.isError && (
              <p role="alert" className="text-sm text-destructive">
                {toErrorMessage(updateUser.error)}
              </p>
            )}

            <div className="flex w-fit justify-between gap-2 pt-3 md:w-full md:justify-end md:pt-5">
              <Button
                type="submit"
                isLoading={updateUser.isPending}
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 md:max-w-56.5 md:px-5"
              >
                Save Profile
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={updateUser.isPending}
                onClick={handleCancel}
                className="w-full rounded-full md:max-w-56.5 md:px-5"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Fact
              label="First Name"
              value={firstName}
              icon={<IoPersonOutline className="size-4" />}
              loading={isBlank}
            />
            <Fact
              label="Last Name"
              value={lastName}
              icon={<IoPersonOutline className="size-4" />}
              loading={isBlank}
            />
            <Fact
              label="Email Address"
              value={email}
              icon={<Mail className="size-4" />}
              loading={isBlank}
            />
            <Fact
              label="Phone Number"
              value={phone}
              icon={<Phone className="size-4" />}
              loading={isBlank}
            />
            <Fact
              label="Location"
              value={location ?? ""}
              icon={<MapPin className="size-4" />}
              loading={directory.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}
