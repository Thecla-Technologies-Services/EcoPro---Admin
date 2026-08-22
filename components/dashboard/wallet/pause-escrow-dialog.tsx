import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {SuccessState} from "./detail-row";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type PauseStep = "form" | "loading" | "success";

interface PauseEscrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PauseEscrowDialog({
  open,
  onOpenChange,
}: PauseEscrowDialogProps) {
  const [reason, setReason] = React.useState("");
  const [step, setStep] = React.useState<PauseStep>("form");


  async function handlePause() {
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
              Pause Escrow
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mb-4 leading-relaxed">
              Pausing this escrow will temporarily halt the transaction and
              prevent fund release or completion until it is resumed.
            </DialogDescription>

            <Textarea
              placeholder="Enter reason"
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
                onClick={handlePause}
                disabled={step === "loading" || !reason.trim()}
              >
                Pause Escrow
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">Escrow Paused</DialogTitle>
            <DialogDescription className="sr-only">
              This escrow has been paused.
            </DialogDescription>
            <SuccessState
              title="Escrow Paused Successfully"
              description="This escrow has been paused and no further actions can be taken until it is resumed. The transaction status has been updated accordingly."
              onDone={() => onOpenChange(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
