"use client";

import * as React from "react";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { Button } from "@/components/ui/button";

type PublishStep = "confirm" | "success";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  durationText?: string;
}

export function PublishDialog({
  open,
  onOpenChange,
  onConfirm,
  durationText = "52 days, expiring on June 15th, 2028",
}: PublishDialogProps) {
  const [step, setStep] = React.useState<PublishStep>("confirm");

  function handleConfirm() {
    setStep("success");
    onConfirm?.();
  }

  return (
    <ConfirmActionDialog
      key={String(open)}  // remounts when dialog opens → step resets to "confirm"
      open={open}
      onOpenChange={onOpenChange}
      status="confirmed"
      title={
        step === "confirm"
          ? "Are you sure you want to publish?"
          : "Your Campaign has been Published"
      }
      description={`Your campaign has been published successfully and will run for ${durationText}.`}
    >
      {step === "confirm" ? (
        <>
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full bg-[#2D7A4F] hover:bg-[#235f3d] text-white"
            onClick={handleConfirm}
          >
            Yes
          </Button>
        </>
      ) : (
        <Button
          className="w-full rounded-full bg-[#2D7A4F] hover:bg-[#235f3d] text-white"
          onClick={() => onOpenChange(false)}
        >
          Seen
        </Button>
      )}
    </ConfirmActionDialog>
  );
}