"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { SuccessState } from "./detail-row";
import { Button } from "@/components/ui/button";

type ReleaseStep = "confirm" | "loading" | "success";

interface ForceReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForceReleaseDialog({
  open,
  onOpenChange,
}: ForceReleaseDialogProps) {
  const [step, setStep] = React.useState<ReleaseStep>("confirm");
  async function handleRelease() {
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
            <div className="flex justify-start mb-5">
              <Image
                src={"/assets/images/check-circle.gif"}
                alt="Success"
                width={90}
                height={90}
              />
            </div>

            <DialogTitle className="text-base font-semibold mb-1">
              Force Release Payment
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mb-6 leading-relaxed">
              This action will immediately release the escrowed funds to the
              seller. This action cannot be undone.
            </DialogDescription>

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
                onClick={handleRelease}
                disabled={step === "loading"}
              >
                Release Funds
              </Button>
            </div>
          </>
        ) : (
          <SuccessState
            title="Funds Released Successfully"
            description="The escrowed funds have been released to the seller successfully. This action has been logged and is now reflected in the transaction history."
            onDone={() => onOpenChange(false)}
          />
        )}

        {step === "success" && (
          <>
            <DialogTitle className="sr-only">Funds Released</DialogTitle>
            <DialogDescription className="sr-only">
              Escrow funds were released to the seller.
            </DialogDescription>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
