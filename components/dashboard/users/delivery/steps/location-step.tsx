"use client";

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingSelect } from "@/components/shared/form/floating-select";
import { COUNTRY_OPTIONS } from "@/constants/country";
import { NIGERIAN_STATES_WITH_LGAS } from "@/constants/user";
import type { Country } from "@/types/api/admin";
import type { DeliveryPartnerFormValues } from "@/types/user";

interface LocationStepProps {
  control: Control<DeliveryPartnerFormValues>;
  errors: FieldErrors<DeliveryPartnerFormValues>;
  setValue: UseFormSetValue<DeliveryPartnerFormValues>;
  country: Country;
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
            options={COUNTRY_OPTIONS}
            value={field.value}
            onChange={(value) => {
              field.onChange(value);
              setValue("state", undefined);
              setValue("lga", undefined);
              setValue("region", undefined);
              // The gateway serves a different bank list per country, so a
              // code picked for the old one would no longer resolve — and the
              // account number and the holder name the bank returned for it
              // belong to that bank, not this one.
              setValue("bankName", "");
              setValue("bankCode", "");
              setValue("bankAccountNumber", "");
              setValue("accountHolderName", undefined);
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
    </div>
  );
}
