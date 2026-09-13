"use client";

import * as React from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { AmountBanner } from "./amount-banner";
import { DetailRow, SuccessState } from "./detail-row";
import { type WithdrawalRequest } from "@/types/wallet";
import { formatWithdrawalAmount } from "@/lib/adapters/wallet";
import { useApproveWithdrawal } from "@/hooks/admin/use-payouts";
import { useAsyncAction } from "@/hooks/use-async-action";
import { toErrorMessage } from "@/lib/api/errors";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const approveWithdrawal = useApproveWithdrawal();
  const requestId = request?.id;

  // `useAsyncAction` owns the confirm → loading → success steps, which is what
  // keeps a rejected approval on the confirm step with its reason instead of
  // announcing a payout the gateway refused.
  const approve = useAsyncAction(async () => {
    if (!requestId) throw new Error("This request has no id to approve.");
    await approveWithdrawal.mutateAsync(requestId);
  });

  if (!request) return null;

  const loading = approve.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm gap-0">
        <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" />

        {!approve.isSuccess ? (
          <>
            <DialogTitle className="text-base font-semibold mb-0.5">
              Approve Withdrawal
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mb-4">
              Are you sure you want to approve this request
            </DialogDescription>

            <AmountBanner amount={request.amount} />

            <div className="flex flex-col">
            <DetailRow label="Request ID" value={request.reference} />
            <DetailRow label="Account Name" value={request.accountName} />
            <DetailRow label="Bank Name" value={request.bankName} />
            <DetailRow label="Account Number" value={request.accountNumber} />
            {request.sortCode && (
              <DetailRow label="Sort Code" value={request.sortCode} />
            )}
            <DetailRow
              label="Fee"
              value={formatWithdrawalAmount(request.fee, request.currency)}
            />
            <DetailRow
              label="Total Deducted"
              value={formatWithdrawalAmount(
                request.totalDeducted,
                request.currency,
              )}
            />
            <DetailRow
              label="Status"
              value={<StatusBadge status={request.status} />}
            />
            <DetailRow label="Date" value={request.date} />
            </div>

            {approve.error && (
              <p role="alert" className="mt-4 text-xs text-destructive">
                {toErrorMessage(approve.error)}
              </p>
            )}

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
                onClick={() => approve.run()}
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
              onDone={() => {
                approve.reset();
                onOpenChange(false);
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
