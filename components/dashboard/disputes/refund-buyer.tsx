"use client";

import { useState } from "react";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { Button } from "@/components/ui/button";

interface RefundBuyerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amount: string;
  buyerName: string;
  onConfirm: () => Promise<void>;
}

export function RefundBuyerDialog({
  open,
  onOpenChange,
  amount,
  buyerName,
  onConfirm,
}: RefundBuyerDialogProps) {
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
        title="Refund Successful"
        description={`${amount} has been successfully refunded to ${buyerName}. The dispute has been resolved and the transaction is now closed.`}
        iconClassName="text-green-600"
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

  // ── Confirm state ──────────────────────────────────────────────────────
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Refund Buyer"
      description={`You are about to refund ${amount} from escrow to the buyer.`}
      iconClassName="text-green-600"
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
          {isLoading ? "" : "Confirm Refund"}
        </Button>
      </div>
    </ConfirmActionDialog>
  );
}
