"use client";

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingSelect } from "@/components/shared/form/floating-select";
import { COUNTRIES, NIGERIAN_STATES_WITH_LGAS } from "@/constants/user";
import type { DeliveryPartnerFormValues } from "@/types/user";

interface LocationStepProps {
  control: Control<DeliveryPartnerFormValues>;
  errors: FieldErrors<DeliveryPartnerFormValues>;
  setValue: UseFormSetValue<DeliveryPartnerFormValues>;
  country: string;
  state?: string;
}

export function LocationStep({
  control,
  errors,
  setValue,
  country,
  state,
}: LocationStepProps) {
  const isNigeria = country === "Nigeria";
  const lgaOptions = state ? (NIGERIAN_STATES_WITH_LGAS[state] ?? []) : [];

  return (
    <div className="space-y-5">
      {/* Country */}
      <Controller
        control={control}
        name="country"
        render={({ field }) => (
          <FloatingSelect
            label="Country"
            options={COUNTRIES}
            value={field.value}
            onChange={(value) => {
              field.onChange(value);
              setValue("state", undefined);
              setValue("lga", undefined);
              setValue("region", undefined);
            }}
            error={errors.country?.message}
          />
        )}
      />

      {isNigeria ? (
        <>
          {/* State */}
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <FloatingSelect
                label="State"
                options={Object.keys(NIGERIAN_STATES_WITH_LGAS)}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue("lga", undefined);
                }}
                error={errors.state?.message}
              />
            )}
          />

          {/* LGA */}
          <Controller
            control={control}
            name="lga"
            render={({ field }) => (
              <FloatingSelect
                label="LGA"
                options={lgaOptions}
                value={field.value}
                onChange={field.onChange}
                disabled={!state}
                error={errors.lga?.message}
              />
            )}
          />
        </>
      ) : (
        /* Region */
        <Controller
          control={control}
          name="region"
          render={({ field }) => (
            <FloatingLabelInput
              label="Region"
              placeholder="e.g. England"
              error={errors.region?.message}
              {...field}
            />
          )}
        />
      )}

      {/* City */}
      <Controller
        control={control}
        name="city"
        render={({ field }) => (
          <FloatingLabelInput
            label="City"
            placeholder="e.g. Ikotun"
            error={errors.city?.message}
            {...field}
          />
        )}
      />

      {/* Area */}
      <Controller
        control={control}
        name="area"
        render={({ field }) => (
          <FloatingLabelInput
            label="Area"
            placeholder="e.g. Ikotun Egbe"
            error={errors.area?.message}
            {...field}
          />
        )}
      />

      {/* Auto Verify Email */}
      <Controller
        control={control}
        name="verifyEmailAutomatically"
        render={({ field }) => (
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-neutral-600">
              Verify Email Automatically
            </span>

            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
    </div>
  );
}
