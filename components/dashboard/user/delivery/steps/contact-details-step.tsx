"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { DeliveryPartnerFormValues } from "@/types/user";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingPhoneInput } from "@/components/shared/form/floating-phone-input";

interface ContactDetailsStepProps {
  control: Control<DeliveryPartnerFormValues>;
  errors: FieldErrors<DeliveryPartnerFormValues>;
  existingImageUrl?: string;
}

export function ContactDetailsStep({
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
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Profile"
                    fill
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-5 w-5 text-neutral-400" />
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
        name="contactPersonName"
        render={({ field }) => (
          <FloatingLabelInput
            label="Contact Person Name"
            error={errors.contactPersonName?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <FloatingLabelInput
            label="Email Address"
            error={errors.email?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <FloatingPhoneInput
            label="Phone Number"
            error={errors.phone?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="businessName"
        render={({ field }) => (
          <FloatingLabelInput
            label="Business Name"
            id="businessName"
            placeholder="e.g. GIG Logistics"
            error={errors.businessName?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="utrNumber"
        render={({ field }) => (
          <FloatingLabelInput
            label="UTR Number"
            error={errors.utrNumber?.message}
            {...field}
          />
        )}
      />
    </div>
  );
}
