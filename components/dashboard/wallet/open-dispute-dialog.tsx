"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SuccessState } from "./detail-row";

type DisputeStep = "form" | "loading" | "success";

interface OpenDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpenDisputeDialog({
  open,
  onOpenChange,
}: OpenDisputeDialogProps) {
  const [reason, setReason] = React.useState("");
  const [step, setStep] = React.useState<DisputeStep>("form");

  async function handleSubmit() {
    setStep("loading");
    await new Promise((r) => setTimeout(r, 1400));
    setStep("success");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm gap-0">
        <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" />

        {step !== "success" ? (
          <>
            <DialogTitle className="text-base font-semibold mb-1">
              Open Dispute
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mb-4 leading-relaxed">
              Opening a dispute will flag this transaction for review. Funds
              will remain held in escrow until the dispute is resolved.
            </DialogDescription>

            <Textarea
              placeholder="Describe the reason for the dispute..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
                isLoading={step === "loading"}
                className="flex-1 rounded-full bg-[#2D7A4F] hover:bg-[#235f3d] text-white"
                onClick={handleSubmit}
                disabled={step === "loading" || !reason.trim()}
              >
                Open Dispute
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">Dispute Opened</DialogTitle>
            <DialogDescription className="sr-only">
              A dispute has been opened for this transaction.
            </DialogDescription>
            <SuccessState
              title="Dispute Opened Successfully"
              description="This transaction has been flagged for review. Funds will remain held in escrow until the dispute is resolved."
              onDone={() => onOpenChange(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
