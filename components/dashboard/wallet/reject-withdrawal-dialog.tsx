"use client";

import * as React from "react";

import {  ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type WithdrawalRequest} from "@/types/wallet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SuccessState } from "./detail-row";


const REJECTION_REASONS = [
  "Blurry Document",
  "Name Mismatch",
  "Expired Document",
  "Invalid CAC Certificate",
];

type RejectStep = "form" | "loading" | "success";

interface RejectWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: WithdrawalRequest | null;
  onBack?: () => void;
}

export function RejectWithdrawalDialog({
  open,
  onOpenChange,
  request,
  onBack,
}: RejectWithdrawalDialogProps) {
  const [selectedReason, setSelectedReason] = React.useState<string | null>(
    null,
  );
  const [note, setNote] = React.useState("");
  const [step, setStep] = React.useState<RejectStep>("form");


  if (!request) return null;

  async function handleReject() {
    setStep("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setStep("success");
  }

  const canSubmit = !!selectedReason || note.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0">
        <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
        </DialogClose>

        {step !== "success" ? (
          <>
            <div className="flex items-center gap-2 mb-5">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <DialogTitle className="text-base font-semibold">
                Reject Withdrawal
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              Select a reason for rejecting this withdrawal request.
            </DialogDescription>

            <div className="flex flex-col gap-2 mb-4">
              {REJECTION_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() =>
                    setSelectedReason(selectedReason === reason ? null : reason)
                  }
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-sm font-medium border transition-all",
                    selectedReason === reason
                      ? "border-[#2D7A4F] bg-white text-gray-900 ring-1 ring-[#2D7A4F]"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300",
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-2">
              Additional note for rejection
            </p>
            <Textarea
              placeholder="Enter reason"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none h-28 bg-gray-50 border-gray-200 text-sm placeholder:text-gray-400 mb-5"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={step === "loading"}
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "flex-1 rounded-full text-white",
                  canSubmit
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-red-300 cursor-not-allowed",
                )}
                onClick={handleReject}
                disabled={step === "loading" || !canSubmit}
              >
                {step === "loading" ? (
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
                  "Reject Withdrawal"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">Withdrawal Rejected</DialogTitle>
            <DialogDescription className="sr-only">
              The withdrawal has been rejected.
            </DialogDescription>
            <SuccessState
              title="Withdrawal Rejected Successfully"
              description="The withdrawal request has been rejected. The user will be notified accordingly."
              onDone={() => onOpenChange(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
