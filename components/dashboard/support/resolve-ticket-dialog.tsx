"use client";

import { useState } from "react";
import { ActionDialog } from "@/components/shared/action-dialog";
import { ChoiceList } from "@/components/shared/choice-list";
import { Textarea } from "@/components/ui/textarea";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useResolveSupportTicket } from "@/hooks/admin/use-support";
import { TICKET_STATUS_OPTIONS } from "@/constants/support-ticket-status";
import type { SupportTicketStatus } from "@/types/api/admin";
import type { SupportTicket } from "@/types/support";

/**
 * Moves a ticket to a new status.
 *
 * The endpoint is called `resolve` but takes the target status in its body, so
 * this is how a ticket is picked up as well as how it is closed — hence a
 * status picker rather than a yes/no confirm.
 */
export function ResolveTicketDialog({
  open,
  onOpenChange,
  ticket,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: SupportTicket | null;
}) {
  const [status, setStatus] = useState<SupportTicketStatus>("Resolved");
  const [note, setNote] = useState("");

  const resolveTicket = useResolveSupportTicket();
  const ticketId = ticket?.id;

  const resolve = useAsyncAction(async () => {
    if (!ticketId) throw new Error("This ticket has no id to update.");
    await resolveTicket.mutateAsync({
      ticketId,
      status,
      note: note.trim() || undefined,
    });
  });

  function close() {
    resolve.reset();
    setNote("");
    setStatus("Resolved");
    onOpenChange(false);
  }

  if (!ticket) return null;

  const statusLabel = TICKET_STATUS_OPTIONS.find(
    (option) => option.value === status,
  )?.label;

  return (
    <ActionDialog open={open} onOpenChange={(next) => !next && close()}>
      {resolve.isSuccess ? (
        <>
          <ActionDialog.Media />
          <ActionDialog.Title>Ticket Updated</ActionDialog.Title>
          <ActionDialog.Description>
            The ticket is now marked {statusLabel}.
          </ActionDialog.Description>
          <ActionDialog.Actions>
            <ActionDialog.Done onClick={close}>Done</ActionDialog.Done>
          </ActionDialog.Actions>
        </>
      ) : (
        <>
          <ActionDialog.Title>Update Ticket</ActionDialog.Title>
          <ActionDialog.Description>
            {ticket.category} — {ticket.description}
          </ActionDialog.Description>

          {/* The API's status values, not their labels, are what is sent. */}
          <ChoiceList
            value={status}
            onChange={(next) => setStatus(next as SupportTicketStatus)}
            className="my-4"
          >
            {TICKET_STATUS_OPTIONS.map((option) => (
              <ChoiceList.Option key={option.value} value={option.value}>
                {option.label}
              </ChoiceList.Option>
            ))}
          </ChoiceList>

          <Textarea
            placeholder="Note for the reporter (optional)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mb-4 h-24 resize-none text-sm"
          />

          <ActionDialog.Error error={resolve.error} />

          <ActionDialog.Actions>
            <ActionDialog.Cancel onClick={close} disabled={resolve.isLoading} />
            <ActionDialog.Confirm
              onClick={() => resolve.run()}
              isLoading={resolve.isLoading}
            >
              Update Ticket
            </ActionDialog.Confirm>
          </ActionDialog.Actions>
        </>
      )}
    </ActionDialog>
  );
}
