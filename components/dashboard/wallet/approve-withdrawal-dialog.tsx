"use client";

import * as React from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { AmountBanner } from "./amount-banner";
import { DetailRow, SuccessState } from "./detail-row";
import { type WithdrawalRequest } from "@/types/wallet";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
type ApproveStep = "confirm" | "success";

interface ApproveWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: WithdrawalRequest | null;
  onReject?: () => void; // navigate to reject flow
}

export function ApproveWithdrawalDialog({
  open,
  onOpenChange,
  request,
  onReject,
}: ApproveWithdrawalDialogProps) {
  const [step, setStep] = React.useState<ApproveStep>("confirm");
  const [loading, setLoading] = React.useState(false);

  if (!request) return null;

  async function handleApprove() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate API
    setLoading(false);
    setStep("success");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0">
        <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
        </DialogClose>

        {step === "confirm" ? (
          <>
            <DialogTitle className="text-base font-semibold mb-0.5">
              Approve Withdrawal
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mb-4">
              Are you sure you want to approve this request
            </DialogDescription>

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
            </div>

            <div className="flex gap-2 mt-5">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => onReject?.()}
                disabled={loading}
              >
                Reject
              </Button>
              <Button
                className="flex-1 rounded-full bg-[#2D7A4F] hover:bg-[#235f3d] text-white"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce [animation-delay:0.15s]">
                      ●
                    </span>
                    <span className="animate-bounce [animation-delay:0.3s]">
                      ●
                    </span>
                  </span>
                ) : (
                  "Yes, Approve Withdrawal"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">Withdrawal Approved</DialogTitle>
            <DialogDescription className="sr-only">
              Your withdrawal approval was successful.
            </DialogDescription>
            <SuccessState
              title="Withdrawal Approved Successfully"
              description="Your payment request has been approved successfully. Go back to your dashboard."
              onDone={() => onOpenChange(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
