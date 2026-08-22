"use client";

import { AtSign, Camera, Phone } from "lucide-react";
import Image from "next/image";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { IoPersonOutline } from "react-icons/io5";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { NgoFormValues } from "@/types/user";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingPhoneInput } from "@/components/shared/form/floating-phone-input";

interface ContactDetailsStepProps {
  control: Control<NgoFormValues>;
  errors: FieldErrors<NgoFormValues>;
  existingImageUrl?: string;
}

export function NGOContactDetailsStep({
  control,
  errors,
  existingImageUrl,
}: ContactDetailsStepProps) {
  return (
    <div className="space-y-5">
      <Controller
        control={control}
        name="profileImage"
        render={({ field }) => {
          const previewUrl = field.value
            ? URL.createObjectURL(field.value as File)
            : existingImageUrl;
          return (
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative flex size-25 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Profile"
                    fill
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="size-7 text-neutral-400" />
                )}
              </div>
              <span className="text-sm text-neutral-400">
                Profile Image (Optional)
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  field.onChange(event.target.files?.[0] ?? null)
                }
              />
            </label>
          );
        }}
      />

      <Controller
        control={control}
        name="organisationName"
        render={({ field }) => (
          <FloatingLabelInput
            label="Organisation Name"
            icon={<HiOutlineBuildingOffice2 className="size-5" />}
            error={errors.organisationName?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="contactPersonName"
        render={({ field }) => (
          <FloatingLabelInput
            label="Contact Person Name"
            icon={<IoPersonOutline className="size-5" />}
            error={errors.contactPersonName?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="contactEmail"
        render={({ field }) => (
          <FloatingLabelInput
            label="Contact Email Address"
            type="email"
            icon={<AtSign className="size-5" />}
            error={errors.contactEmail?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="contactPhone"
        render={({ field }) => (
          <FloatingPhoneInput
            label="Contact Phone Number"
            icon={<Phone className="size-5" />}
            value={field.value}
            onChange={field.onChange}
            error={errors.contactPhone?.message}
          />
        )}
      />
    </div>
  );
}
