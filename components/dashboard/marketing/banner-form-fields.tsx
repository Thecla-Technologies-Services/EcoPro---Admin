import { Control, Controller, FieldErrors } from "react-hook-form";
import { FloatingDatePicker } from "@/components/shared/floating-date-picker";
import { FloatingLabelInput } from "@/components/shared/floating-label-input";
import { FloatingSelect } from "@/components/shared/floating-select";
import SectionCard from "./section-card";
import { PLACEMENTS, AUDIENCES } from "@/data/marketing";
import type { BannerFormValues } from "@/types/marketing";




interface BannerFormFieldsProps {
  control: Control<BannerFormValues>;
  errors: FieldErrors<BannerFormValues>;
}

export function BannerFormFields({ control, errors }: BannerFormFieldsProps) {
  return (
    <>
      <SectionCard title="Campaign Details">
        <div className="flex flex-col gap-3">
          <Controller
            name="campaignName"
            control={control}
            rules={{ required: "Campaign name is required" }}
            render={({ field }) => (
              <FloatingLabelInput
                label="Campaign Name"
                value={field.value}
                onChange={field.onChange}
                error={errors.campaignName?.message}
              />
            )}
          />
          <Controller
            name="destinationUrl"
            control={control}
            rules={{ required: "Destination URL is required" }}
            render={({ field }) => (
              <FloatingLabelInput
                label="Destination URL or In-App Route"
                value={field.value}
                onChange={field.onChange}
                error={errors.destinationUrl?.message}
              />
            )}
          />
        </div>
      </SectionCard>

      <SectionCard title="Targeting & Placement">
        <div className="flex flex-col gap-3">
          <Controller
            name="placement"
            control={control}
            rules={{ required: "Placement is required" }}
            render={({ field }) => (
              <FloatingSelect
                label="App Placement"
                value={field.value}
                onChange={field.onChange}
                options={PLACEMENTS}
                error={errors.placement?.message}
              />
            )}
          />
          <Controller
            name="audience"
            control={control}
            rules={{ required: "Target audience is required" }}
            render={({ field }) => (
              <FloatingSelect
                label="Target Audience"
                value={field.value}
                onChange={field.onChange}
                options={AUDIENCES}
                error={errors.audience?.message}
              />
            )}
          />
        </div>
      </SectionCard>

      <SectionCard title="Scheduling">
        <div className="flex flex-col gap-3">
          <Controller
            name="startDate"
            control={control}
            rules={{ required: "Start date is required" }}
            render={({ field }) => (
              <FloatingDatePicker
                id="startDate"
                label="Start Date"
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => field.onChange(date?.toISOString() ?? "")}
                error={errors.startDate?.message}
              />
            )}
          />
          <Controller
            name="endDate"
            control={control}
            rules={{ required: "End date is required" }}
            render={({ field }) => (
              <FloatingDatePicker
                id="endDate"
                label="End Date"
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => field.onChange(date?.toISOString() ?? "")}
                error={errors.endDate?.message}
              />
            )}
          />
        </div>
      </SectionCard>
    </>
  );
}
