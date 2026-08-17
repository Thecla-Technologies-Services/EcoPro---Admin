"use client";

import { useState } from "react";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { Button } from "@/components/ui/button";

interface ReleaseSellerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amount: string;
  sellerName: string; // e.g. "Bayo Adenuga"
  onConfirm: () => Promise<void>;
}

export function ReleaseSellerDialog({
  open,
  onOpenChange,
  amount,
  sellerName,
  onConfirm,
}: ReleaseSellerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    setIsSuccess(true);
  };

  const handleDone = () => {
    setIsSuccess(false);
    onOpenChange(false);
  };

  if (isSuccess) {
    return (
      <ConfirmActionDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) handleDone();
        }}
        title="Funds Released Successfully"
        description={`${amount} has been released to ${sellerName}. The dispute has been resolved and the transaction is now closed.`}
      >
        <Button
          className="w-full rounded-full bg-primary text-white hover:bg-green-800"
          onClick={handleDone}
        >
          Done
        </Button>
      </ConfirmActionDialog>
    );
  }

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Release to Seller"
      description={`You are about to release ${amount} from escrow to the seller.`}
    >
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          className="flex-1 rounded-full"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 rounded-full bg-primary text-white hover:bg-green-800"
          onClick={handleConfirm}
          isLoading={isLoading}
        >
          {isLoading ? "" : "Release Funds"}
        </Button>
      </div>
    </ConfirmActionDialog>
  );
}
