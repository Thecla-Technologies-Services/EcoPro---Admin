 
"use client";

import type { Listing } from "@/types/listing";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { toErrorMessage } from "@/lib/api/errors";
import {  useState } from "react";

interface FlagListingDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  listing: Listing
  onFlag: (reason: string) => Promise<void>
}
 
export function FlagListingDialog({
  open,
  onOpenChange,
  listing,
  onFlag,
}: FlagListingDialogProps) {
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFlag = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await onFlag(reason)
      onOpenChange(false)
      setSuccessOpen(true)
    } catch (failure) {
      // Keep the dialog open so the typed reason isn't lost and can be retried.
      setError(toErrorMessage(failure))
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <>
      <Dialog key={listing.id} open={open} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="max-w-sm gap-0 p-4 md:p-6">
          <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" />
 
          <DialogTitle className="text-base md:text-lg text-foreground font-semibold mb-2">Flag Listing</DialogTitle>
          <p className="text-sm text-muted-foreground mb-4">Reason for flagging</p>
 
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason"
            rows={5}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground focus:border-primary focus:border-2 transition-all mb-3"
          />
 
          <p className="text-xs text-muted-foreground mb-5">
            This listing will be marked as flagged and hidden from public view until reviewed.
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
              className="flex-1 rounded-full bg-orange-500 text-white hover:bg-orange-600"
              onClick={handleFlag}
              isLoading={isLoading}
              disabled={!reason.trim()}
            >
              Flag Listing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
 
      {/* Success */}
      <ConfirmActionDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Listing Flagged Successfully"
        description="The listing is now marked as flagged and hidden from public view until it is reviewed."
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
  )
}
 
