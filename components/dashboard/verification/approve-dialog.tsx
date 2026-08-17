"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";

type State = "confirm" | "loading" | "success";

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  applicantName: string;
  accountType: string;
  onApprove: () => Promise<void>;
}

export function ApproveDialog({
  open,
  onOpenChange,
  applicantName,
  accountType,
  onApprove,
}: ApproveDialogProps) {
  const [state, setState] = useState<State>("confirm");

  const handleApprove = async () => {
    setState("loading");
    await onApprove();
    setState("success");
  };

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        state === "success" ? "Verification Approved" : "Approve Verification"
      }
      description={
        state === "success"
          ? `${applicantName} ${accountType} account has been verified and confirmation email sent`
          : `You are about to approve the verification for ${applicantName}. Ensure all the necessary due diligence have been carried out.`
      }
      iconClassName={
        state === "success" ? "text-primary" : "text-muted-foreground"
      }
    >
      {state === "success" ? (
        <Button
          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => onOpenChange(false)}
        >
          Done
        </Button>
      ) : (
        <>
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            disabled={state === "loading"}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            isLoading={state === "loading"}
            onClick={handleApprove}
          >
            Yes, Approve
          </Button>
        </>
      )}
    </ConfirmActionDialog>
  );
}
