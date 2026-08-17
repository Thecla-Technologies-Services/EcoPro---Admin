"use client";

import { ActionDialog } from "@/components/shared/action-dialog";
import { useAsyncAction } from "@/hooks/use-async-action";

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
  const approve = useAsyncAction(onApprove);

  // The dialog is reused for every row, so a previous outcome has to be cleared
  // before it opens on the next applicant.
  const handleOpenChange = (next: boolean) => {
    if (!next) approve.reset();
    onOpenChange(next);
  };

  return (
    <ActionDialog open={open} onOpenChange={handleOpenChange}>
      <ActionDialog.Media />

      {approve.isSuccess ? (
        <>
          <ActionDialog.Title>Verification Approved</ActionDialog.Title>
          <ActionDialog.Description>
            {applicantName} {accountType} account has been verified and
            confirmation email sent
          </ActionDialog.Description>
          <ActionDialog.Actions>
            <ActionDialog.Done onClick={() => handleOpenChange(false)} />
          </ActionDialog.Actions>
        </>
      ) : (
        <>
          <ActionDialog.Title>Approve Verification</ActionDialog.Title>
          <ActionDialog.Description>
            You are about to approve the verification for {applicantName}.
            Ensure all the necessary due diligence have been carried out.
          </ActionDialog.Description>

          {/* A failed review must not read as an approval — the flow stays on
              this step with the API's own message so it can be retried. */}
          <ActionDialog.Error error={approve.error} />

          <ActionDialog.Actions>
            <ActionDialog.Cancel
              disabled={approve.isLoading}
              onClick={() => handleOpenChange(false)}
            />
            <ActionDialog.Confirm
              isLoading={approve.isLoading}
              onClick={() => approve.run()}
            >
              Yes, Approve
            </ActionDialog.Confirm>
          </ActionDialog.Actions>
        </>
      )}
    </ActionDialog>
  );
}
