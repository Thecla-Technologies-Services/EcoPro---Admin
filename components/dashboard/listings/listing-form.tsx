"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FloatingSelect } from "@/components/shared/floating-select";
import ImageUploader from "@/components/shared/image-uploader";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/shared/floating-label-input";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { listingSchema } from "@/lib/validations/listings";
import { FloatingLabelTextarea } from "@/components/shared/floating-label-text-area";
import { useCreateListing } from "@/hooks/admin/use-listings";
import { useCategories } from "@/hooks/marketplace/use-categories";
import { toErrorMessage } from "@/lib/api/errors";
import {
  CONDITION_OPTIONS,
  LISTING_TYPE_OPTIONS,
} from "@/lib/adapters/listing";

type ListingFormData = z.input<typeof listingSchema>;

interface ListingFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /**
   * Only "add" is reachable today — the Admin API has no update endpoint for a
   * listing. Restoring edit means adding back a `listing` prop to seed the form.
   */
  mode: "add" | "edit";
}

const EMPTY_FORM: Partial<ListingFormData> = {
  title: "",
  description: "",
  category: "",
  condition: "",
  brand: "",
  size: "",
  type: "",
  price: undefined,
};

export function ListingFormDialog({
  open,
  onOpenChange,
  mode,
}: ListingFormDialogProps) {
  /**
   * NOT PERSISTED: `CreateAdminListingRequestDto` accepts no media, brand or
   * size, and the Admin API has no listing-media endpoint. These inputs are
   * kept so the form still matches the design, but their values are dropped on
   * submit — see the note in the PR description.
   */
  const [images, setImages] = useState<string[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [savedTitle, setSavedTitle] = useState("");

  const createListing = useCreateListing();
  const { data: categories = [], isPending: categoriesPending } = useCategories();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: EMPTY_FORM,
  });

  /**
   * Clearing on close rather than in an effect on open: the dialog is always
   * dismissed through here, so the next open starts blank without a render pass
   * that writes state.
   */
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset(EMPTY_FORM);
      createListing.reset();
      setImages([]);
    }
    onOpenChange(next);
  };

  const categoryNames = categories.map((c) => c.name ?? "").filter(Boolean);

  const onSubmit = (data: ListingFormData) => {
    const categoryId = categories.find((c) => c.name === data.category)?.id;

    createListing.mutate(
      {
        title: data.title,
        description: data.description,
        // The API keys categories by GUID, so an unmatched name is sent as
        // undefined rather than as free text it would reject.
        categoryId,
        condition: CONDITION_OPTIONS.find((c) => c.label === data.condition)
          ?.value,
        listingType: LISTING_TYPE_OPTIONS.find((t) => t.label === data.type)
          ?.value,
        price: data.price ? Number(data.price) : null,
      },
      {
        onSuccess: () => {
          setSavedTitle(data.title);
          handleOpenChange(false);
          setSuccessOpen(true);
        },
      }
    );
  };

  const isEdit = mode === "edit";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <DialogTitle className="text-base font-semibold">
              {isEdit ? "Edit Listing" : "Add New Listing"}
            </DialogTitle>
            <DialogClose className="text-muted-foreground hover:text-foreground">

            </DialogClose>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="overflow-y-auto max-h-[80vh]"
          >
            <div className="p-4 space-y-3">
              <ImageUploader images={images} onChange={setImages} />

              <FloatingLabelInput
                label="Item Title"
                {...register("title")}
                error={errors.title?.message}
              />

                  <FloatingLabelTextarea
                  label="Description"
                  error={errors.description?.message}
                  {...register("description")}
                />

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <FloatingSelect
                      label="Category"
                      options={categoryNames}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={categoriesPending}
                      error={errors.category?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="condition"
                  render={({ field }) => (
                    <FloatingSelect
                      label="Condition"
                      options={CONDITION_OPTIONS.map((c) => c.label)}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.condition?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingLabelInput label="Brand" {...register("brand")} />
                <FloatingLabelInput label="Size" {...register("size")} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <FloatingSelect
                      label="Type"
                      options={LISTING_TYPE_OPTIONS.map((t) => t.label)}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.type?.message}
                    />
                  )}
                />
                <FloatingLabelInput
                  label="Price (₦)"
                  type="number"
                  // Without valueAsNumber the input hands Zod a string and
                  // `z.number()` rejects every submission.
                  {...register("price", { valueAsNumber: true })}
                  error={errors.price?.message}
                />
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3">
              {createListing.isError && (
                <p role="alert" className="text-sm text-destructive">
                  {toErrorMessage(createListing.error)}
                </p>
              )}
              <Button
                type="submit"
                isLoading={createListing.isPending}
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isEdit ? "Save Changes" : "Create Listing"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success dialog */}
      <ConfirmActionDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Listing Created Successfully"
        description={`${savedTitle} has been created and is now on the platform.`}
        iconClassName="text-primary"
      >
        <Button
          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setSuccessOpen(false)}
        >
          Done
        </Button>
      </ConfirmActionDialog>
    </>
  );
}
