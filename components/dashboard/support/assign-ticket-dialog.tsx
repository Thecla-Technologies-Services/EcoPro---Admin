"use client";

import { useState } from "react";
import { ActionDialog } from "@/components/shared/action-dialog";
import { FloatingSelect } from "@/components/shared/form/floating-select";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useAssignableAdmins } from "@/hooks/admin/use-assignable-admins";
import type { SupportTicket } from "@/types/support";

/**
 * Hands a ticket to an admin — or would, if the API could record it.
 *
 * `SupportTicketDto` carries no assignee and the only write on a ticket is
 * `POST /support/tickets/{id}/resolve`, which takes a status and a note. So the
 * flow is here in full and the save fails, saying why: assigning in the browser
 * alone would show the ticket as handed over on this screen and to nobody else.
 * When the endpoint lands, the body of `assign` becomes the mutation call.
 */
export function AssignTicketDialog({
  open,
  onOpenChange,
  ticket,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: SupportTicket | null;
}) {
  const [assigneeId, setAssigneeId] = useState("");

  // The staff list is live: who can be assigned is a real question the API does
  // answer, even though the assignment itself is not.
  const admins = useAssignableAdmins();

  const assign = useAsyncAction(async () => {
    throw new Error(
      "Support tickets have no assignee in the Admin API, and no endpoint assigns one — so this cannot be saved yet.",
    );
  });

  function close() {
    assign.reset();
    setAssigneeId("");
    onOpenChange(false);
  }

  if (!ticket) return null;

  return (
    <ActionDialog open={open} onOpenChange={(next) => !next && close()}>
      <ActionDialog.Title>Assign Ticket</ActionDialog.Title>
      <ActionDialog.Description>
        Choose the admin who should handle this ticket.
      </ActionDialog.Description>

      <FloatingSelect
        label={admins.isPending ? "Loading admins…" : "Assign to"}
        options={admins.options}
        value={assigneeId}
        onChange={setAssigneeId}
        disabled={admins.isPending || admins.options.length === 0}
        className="mb-4"
      />

      {/* An empty picker looks the same as one nobody has opened yet, so the
          two ways it can come back empty say which happened. */}
      {admins.isError && (
        <ActionDialog.Error error={admins.error} />
      )}
      {!admins.isPending && !admins.isError && admins.options.length === 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          No other admin accounts to assign this to.
        </p>
      )}

      <ActionDialog.Error error={assign.error} />

      <ActionDialog.Actions>
        <ActionDialog.Cancel onClick={close} disabled={assign.isLoading} />
        <ActionDialog.Confirm
          onClick={() => assign.run()}
          isLoading={assign.isLoading}
          disabled={!assigneeId}
        >
          Assign Ticket
        </ActionDialog.Confirm>
      </ActionDialog.Actions>
    </ActionDialog>
  );
}
