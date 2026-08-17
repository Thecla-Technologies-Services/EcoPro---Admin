"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {REJECTION_REASONS} from "@/constants/swap-order";
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type State = "form" | "loading" | "success";



interface RejectDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  applicantName: string;
  applicationId: string;
  orgName: string;
  contactEmail: string;
  onReject: (reason: string, note: string) => Promise<void>;
}

function RejectDialogContent({
  applicantName,
  applicationId,
  orgName,
  contactEmail,
  onReject,
  onOpenChange,
}: Omit<RejectDialogProps, "open">) {
  const [state, setState] = useState<State>("form");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const canSubmit = selectedReason !== null;

  const handleReject = async () => {
    if (!selectedReason) return;
    setState("loading");
    await onReject(selectedReason, note);
    setState("success");
  };

  return (
    <DialogContent className="max-w-sm md:max-w-md gap-0 p-0 overflow-hidden flex flex-col max-h-[85vh]">
      <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10">
      </DialogClose>

      {state === "success" ? (
        /* ── Success state ── */
        <div className="p-3 md:p-4 flex flex-col">
          <div className="flex justify-start mb-5">
            <Image
              src={"/assets/images/check-circle.gif"}
              alt="Success"
              width={90}
              height={90}
            />
          </div>

          <DialogTitle className="text-lg font-semibold mb-2">Verification Rejected</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mb-6">
            Application {applicationId} rejected. Email sent to {applicantName}.
          </DialogDescription>
          <Button
            className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      ) : (
        /* ── Form state ── */
        <>
          {/* Fixed header */}
          <div className="p-4 shrink-0">
            <DialogTitle className="text-lg font-semibold mb-1">Reject Application</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select a reason for rejecting{" "}
              <span className="font-semibold text-foreground">{orgName}</span>. An
              email will be sent to{" "}
              <span className="font-semibold text-foreground">
                {contactEmail}
              </span>{" "}
              with your feedback.
            </DialogDescription>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-3 md:px-4">
            {/* Reason list */}
            <div className="space-y-2 md:space-y-3 mb-5">
              {REJECTION_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={cn(
                    "w-full text-left px-3 py-4 rounded-md text-sm font-semibold md:text-base md:font-bold transition-all border",
                    selectedReason === reason
                      ? "border-primary border-2 text-foreground"
                      : "border-transparent bg-input text-foreground hover:border-border",
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* Additional note */}
            <div className="mb-4">
              <DialogDescription className="text-sm md:text-base font-medium text-foreground mb-2">
                Additional note for rejection
              </DialogDescription>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-md bg-input px-3 py-4 text-sm outline-none resize-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder=""
              />
            </div>
          </div>

          {/* Fixed footer */}
          <div className="p-4 shrink-0 border-t flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              disabled={state === "loading"}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className={cn(
                "flex-1 rounded-full transition-all",
                canSubmit
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-destructive/30 text-white cursor-not-allowed",
              )}
              disabled={!canSubmit || state === "loading"}
              isLoading={state === "loading"}
              onClick={handleReject}
            >
              Confirm Rejection
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  );
}

export function RejectDialog({
  open,
  onOpenChange,
  applicantName,
  applicationId,
  orgName,
  contactEmail,
  onReject,
}: RejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RejectDialogContent
        key={open ? "open" : "closed"}
        applicantName={applicantName}
        applicationId={applicationId}
        orgName={orgName}
        contactEmail={contactEmail}
        onReject={onReject}
        onOpenChange={onOpenChange}
      />
    </Dialog>
  );
}