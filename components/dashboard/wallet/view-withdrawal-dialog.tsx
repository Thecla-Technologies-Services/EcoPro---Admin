import * as React from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { AmountBanner } from "./amount-banner";
import { DetailRow } from "./detail-row";

import { type WithdrawalRequest } from "@/types/wallet";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ViewWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: WithdrawalRequest | null;
  /** Called when "Approve" button is clicked (only shown for Rejected status) */
  onApprove?: () => void;
}

export function ViewWithdrawalDialog({
  open,
  onOpenChange,
  request,
  onApprove,
}: ViewWithdrawalDialogProps) {
  if (!request) return null;

  const isRejected = request.status === "Rejected";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0">
        <DialogTitle className="text-base font-semibold mb-1">
          Withdrawal Details
        </DialogTitle>
        <DialogDescription className="sr-only">
          Details for withdrawal request {request.requestId}
        </DialogDescription>
        <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
        </DialogClose>

        <AmountBanner amount={request.amount} />

        <div className="flex flex-col">
          <DetailRow label="Request ID" value={request.requestId} />
          <DetailRow label="User ID" value={request.userId} />
          <DetailRow label="User" value={request.user} />
          <DetailRow label="Full Name" value={request.fullName} />
          <DetailRow label="Bank Name" value={request.bankName} />
          <DetailRow label="Account Number" value={request.accountNumber} />
          <DetailRow
            label="Status"
            value={<StatusBadge status={request.status} />}
          />
          <DetailRow label="Date" value={request.date} />
          {isRejected && request.note && (
            <DetailRow label="Note" value={request.note} />
          )}
        </div>

        {isRejected && onApprove && (
          <div className="flex gap-2 mt-5">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-full bg-primary hover:bg-[#235f3d] text-white"
              onClick={onApprove}
            >
              Approve
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
