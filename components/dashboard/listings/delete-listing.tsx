"use client";

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { toErrorMessage } from "@/lib/api/errors";
import type { Listing } from "@/types/listings";
import { X } from "lucide-react";

import { useState } from "react";

interface DeleteListingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: Listing;
  onDelete: () => Promise<void>;
}

export function DeleteListingDialog({
  open,
  onOpenChange,
  listing,
  onDelete,
}: DeleteListingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onDelete();
      onOpenChange(false);
      setSuccessOpen(true);
    } catch (failure) {
      setError(toErrorMessage(failure));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog key={listing?.id} open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-w-sm gap-0 p-0 overflow-hidden"
        >
          <DialogClose className="absolute right-4 top-4 z-10 text-white bg-black/30 rounded-full size-6 flex items-center justify-center hover:bg-black/50 transition-colors">
            <X className="size-3" />
          </DialogClose>

          {/* Image header */}
          {listing.images[0] && (
            <div className="w-full relative h-36 overflow-hidden">
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4 md:p-6">
            <DialogTitle className="text-base md:text-lg font-semibold mb-2">
              Delete Listing
            </DialogTitle>
            <p className="text-sm font-medium text-foreground mb-4 md:mb-6">
              This will remove and delete the listing and clear all related
              information. This action{" "}
              <span className="font-semibold text-foreground">CANNOT</span> be
              undone.
            </p>

            {error && (
              <p role="alert" className="text-sm text-destructive mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full bg-destructive text-white hover:bg-destructive/90"
                onClick={handleDelete}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success */}
      <ConfirmActionDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Listing Deleted"
        description="The listing has been deleted successfully. This won't show on the platform again."
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
