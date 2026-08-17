"use client";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { toErrorMessage } from "@/lib/api/errors";
import type { Listing } from "@/types/listings";

interface UnflagListingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: Listing;
  onUnflag: () => Promise<void>;
}

export function UnflagListingDialog({
  open,
  onOpenChange,
  listing,
  onUnflag,
}: UnflagListingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnflag = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onUnflag();
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm gap-0 p-4 md:p-6">
          <DialogTitle className="text-base md:text-lg text-foreground font-semibold mb-2">Unflag Listing</DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-muted-foreground font-medium mb-5">
            This will remove the flag and make the listing active. The issue has
            been resolved and the listing is safe to go live.
          </DialogDescription>

          <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
         
          </DialogClose>

          {/* Listing preview pill */}
          <div>
            <div className="rounded-md grid gap-3 md:gap-4 border border-destructive/30 bg-destructive/5 p-4 mb-5">
              <div className="flex items-start gap-2">
                <Flag className="size-3.5 text-destructive" />
                <div className="grid gap-1">
                  <p className="text-sm font-semibold leading-5.25">{listing.title}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {listing.id}
                  </p>
                </div>
              </div>

              <p className="text-xs text-destructive italic mt-1">
                {listing.flagReason
                  ? `Flagged: ${listing.flagReason}`
                  : "Currently flagged and hidden from public view"}
              </p>
            </div>

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
                className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleUnflag}
                isLoading={isLoading}
              >
                Unflag Listing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success */}
      <ConfirmActionDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Listing Unflagged Successfully"
        description="The flag has been removed and the listing is live on the platform again."
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
