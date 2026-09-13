"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { REJECTION_REASONS } from "@/constants/swap-order";
import { ActionDialog } from "@/components/shared/action-dialog";
import { ChoiceList } from "@/components/shared/choice-list";
import { useAsyncAction } from "@/hooks/use-async-action";
import { rejectionNoteLimit } from "@/lib/adapters/verification";

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
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const reject = useAsyncAction(onReject);
  const canSubmit = selectedReason !== null;

  /**
   * The reason and the note are sent to the API as one string with a documented
   * ceiling, so what is left for the note depends on which reason was picked.
   * Capped here rather than validated on submit: an admin who has typed 1200
   * characters should have been stopped at the keystroke, not at the button.
   */
  const noteLimit = rejectionNoteLimit(selectedReason);
  const noteRemaining = noteLimit - note.length;

  const submit = () => {
    if (!selectedReason) return;
    // A rejected promise keeps the flow on this form rather than claiming the
    // application was rejected and an email sent when neither happened.
    reject.run(selectedReason, note);
  };

  if (reject.isSuccess) {
    return (
      <DialogContent showCloseButton={false} className="max-w-sm gap-0 px-4 py-4 md:max-w-md md:py-6">
        <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" />
        <ActionDialog.Media />
        <ActionDialog.Title>Verification Rejected</ActionDialog.Title>
        <ActionDialog.Description>
          Application {applicationId} rejected. Email sent to {applicantName}.
        </ActionDialog.Description>
        <ActionDialog.Actions>
          <ActionDialog.Done onClick={() => onOpenChange(false)} />
        </ActionDialog.Actions>
      </DialogContent>
    );
  }

  return (
    <DialogContent showCloseButton={false} className="max-w-sm md:max-w-md gap-0 p-0 overflow-hidden flex flex-col max-h-[85vh]">
      <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10" />

      {/* Fixed header */}
      <div className="p-4 shrink-0">
        <DialogTitle className="text-lg font-semibold mb-1">
          Reject Application
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Select a reason for rejecting{" "}
          <span className="font-semibold text-foreground">{orgName}</span>. An
          email will be sent to{" "}
          <span className="font-semibold text-foreground">{contactEmail}</span>{" "}
          with your feedback.
        </DialogDescription>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4">
        <ChoiceList
          value={selectedReason}
          onChange={(next) => {
            setSelectedReason(next);
            // A longer reason shrinks the note's budget, so an already-typed
            // note is trimmed to fit rather than being rejected on submit.
            setNote((current) => current.slice(0, rejectionNoteLimit(next)));
          }}
          className="mb-5"
        >
          <ChoiceList.Options items={REJECTION_REASONS} />
        </ChoiceList>

        <div className="mb-4">
          <label
            htmlFor="rejection-note"
            className="mb-2 block text-sm md:text-base font-medium text-foreground"
          >
            Additional note for rejection
          </label>
          <textarea
            id="rejection-note"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, noteLimit))}
            maxLength={noteLimit}
            rows={3}
            className="w-full rounded-md bg-input px-3 py-4 text-sm outline-none resize-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {/* Only once it is close enough to matter — a counter on an empty
              field is noise. */}
          {noteRemaining <= 100 && (
            <p
              className="mt-1 text-xs text-muted-foreground"
              aria-live="polite"
            >
              {noteRemaining} characters left
            </p>
          )}
        </div>
      </div>

      {/* Fixed footer */}
      <div className="p-4 shrink-0 border-t flex flex-col gap-2">
        <ActionDialog.Error error={reject.error} className="mb-0" />
        <ActionDialog.Actions>
          <ActionDialog.Cancel
            disabled={reject.isLoading}
            onClick={() => onOpenChange(false)}
          />
          <ActionDialog.Destructive
            disabled={!canSubmit}
            isLoading={reject.isLoading}
            onClick={submit}
          >
            Confirm Rejection
          </ActionDialog.Destructive>
        </ActionDialog.Actions>
      </div>
    </DialogContent>
  );
}

export function RejectDialog({ open, onOpenChange, ...props }: RejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Remounted per opening so a previous reason and note don't carry over. */}
      <RejectDialogContent
        key={open ? "open" : "closed"}
        onOpenChange={onOpenChange}
        {...props}
      />
    </Dialog>
  );
}
