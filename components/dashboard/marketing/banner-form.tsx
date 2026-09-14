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
      campaignName: "",
      destinationUrl: "",
      placement: "",
      audience: "",
      startDate: "",
      endDate: "",
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
    // From `lg` up the form fills `main` exactly and the left column is the one
    // thing that scrolls, so the heading, the buttons and the preview stay put.
    // Below `lg` the columns stack, where a pane that scrolls inside a page that
    // also scrolls is worse than letting the whole page move — so the height and
    // the overflow rules are all `lg:`.
    <form
      className="flex flex-col space-y-6 lg:h-full lg:min-h-0"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex shrink-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
            className="rounded-full border-transparent bg-background px-6 hover:bg-muted"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full bg-[#2D7A4F] px-6 hover:bg-[#235f3d] text-white"
          >
            Publish Banner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 flex-1 min-h-0 lg:overflow-hidden">
        <div className="scrollbar-hide pr-1 lg:min-h-0 lg:overflow-y-auto">
          <BannerUpload
            previewUrl={bannerPreviewUrl}
            onFileSelect={handleFile}
            register={register}
            name="bannerFile"
            error={errors.bannerFile?.message}
          />
          <BannerFormFields control={control} errors={errors} />
        </div>

        {/* `lg:h-full` with its own overflow so a short viewport scrolls the
            preview internally rather than clipping the phone. */}
        <div className="scrollbar-hide bg-background rounded-xl h-fit p-4 md:p-6 lg:h-full lg:min-h-0 lg:overflow-y-auto">
          <p className="text-sm font-medium text-gray-900">Live App Preview</p>
          <div className="mt-4 flex items-start justify-center">
            <PhoneMockup
              bannerUrl={bannerPreviewUrl}
              placement={watchedPlacement}
            />
          </div>
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
