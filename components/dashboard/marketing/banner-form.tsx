"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PhoneMockup } from "@/components/dashboard/marketing/phone-mockup";
import { Button } from "@/components/ui/button";
import { PublishDialog } from "@/components/dashboard/marketing/publish-dialog";
import { BannerUpload } from "@/components/dashboard/marketing/banner-upload";
import { BannerFormFields } from "@/components/dashboard/marketing/banner-form-fields";
import type { BannerFormValues } from "@/types/marketing";

export function BannerForm() {
  const router = useRouter();
  const [bannerPreviewUrl, setBannerPreviewUrl] = React.useState<string | null>(
    null,
  );
  const [publishOpen, setPublishOpen] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BannerFormValues>({
    defaultValues: {
      bannerFile: null,
      campaignName: "Easy Laundry Campaign",
      destinationUrl: "/HomeDashboard",
      placement: "Home Dashboard Top",
      audience: "Buyers Only",
      startDate: "Feb 7, 2026",
      endDate: "Feb 7, 2026",
    },
  });

  const watchedPlacement = watch("placement");

  React.useEffect(() => {
    return () => {
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    };
  }, [bannerPreviewUrl]);

  function handleFile(file: File) {
    setValue("bannerFile", file, { shouldValidate: true });
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerPreviewUrl(URL.createObjectURL(file));
  }

  function onSubmit(data: BannerFormValues) {
    console.log("Form submitted:", data);
    setPublishOpen(true);
  }

  return (
    <form
      className="flex flex-col h-full space-y-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Create a new Banner
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Create and manage promotional banners across the app
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg bg-[#2D7A4F] hover:bg-[#235f3d] text-white"
          >
            Publish Banner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 flex-1 min-h-0">
        <div className="pr-1">
          <BannerUpload
            previewUrl={bannerPreviewUrl}
            onFileSelect={handleFile}
            register={register}
            name="bannerFile"
            error={errors.bannerFile?.message}
          />
          <BannerFormFields control={control} errors={errors} />
        </div>

        <div className="bg-gray-50 rounded-xl h-fit border border-gray-100 p-4 flex items-start justify-center">
          <PhoneMockup
            bannerUrl={bannerPreviewUrl}
            placement={watchedPlacement}
          />
        </div>
      </div>

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onConfirm={() => {
          // In real app: submit form data to API here
        }}
      />
    </form>
  );
}
