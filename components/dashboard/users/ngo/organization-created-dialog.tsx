"use client";

import { ActionDialog } from "@/components/shared/action-dialog";

/**
 * Shown once `POST /verification/organizations/create` has returned.
 *
 * It says the organisation is awaiting review rather than active, because that
 * is what creating one does: the account lands in the verification queue and
 * still needs a decision. No credentials are mentioned — unlike the delivery
 * partner endpoint, this one issues none.
 */
export function OrganizationCreatedDialog({
  open,
  onOpenChange,
  organizationName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
}) {
  return (
    <ActionDialog open={open} onOpenChange={onOpenChange}>
      <ActionDialog.Media />
      <ActionDialog.Title>NGO Created Successfully</ActionDialog.Title>
      <ActionDialog.Description>
        {organizationName || "The organisation"} has been added and is now in
        the verification queue awaiting review.
      </ActionDialog.Description>
      <ActionDialog.Actions>
        <ActionDialog.Done onClick={() => onOpenChange(false)}>
          Done
        </ActionDialog.Done>
      </ActionDialog.Actions>
    </ActionDialog>
  );
}
