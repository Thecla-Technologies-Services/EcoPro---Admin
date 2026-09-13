import type { SupportTicketStatus } from "@/types/api/admin";

/** Sentinel for "don't filter", since a tab cannot hold "". */
export const ALL_TICKET_STATUSES = "All";

/**
 * The statuses `GET /support/tickets` filters by, paired with readable labels.
 *
 * Values are the API's own `SupportTicketStatus` enum members, so `InProgress`
 * is sent unspaced however it is displayed. The same three are what
 * `POST /support/tickets/{ticketId}/resolve` moves a ticket between — despite
 * its name, that endpoint takes the target status in its body, so it is also
 * how a ticket is picked up rather than closed.
 */
export const TICKET_STATUS_OPTIONS: {
  value: SupportTicketStatus;
  label: string;
}[] = [
  { value: "Open", label: "Open" },
  { value: "InProgress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
];

/**
 * The table's tabs, which are labels rather than enum members: `DataTable`
 * renders a tab's own string, so a tab holding `InProgress` would read
 * unspaced. `toTicketStatusParam` maps back.
 */
export const TICKET_STATUS_TABS: readonly string[] = [
  ALL_TICKET_STATUSES,
  ...TICKET_STATUS_OPTIONS.map((option) => option.label),
];

/** Drops the sentinel, so an unfiltered view sends no `status` at all. */
export function toTicketStatusParam(
  tab: string,
): SupportTicketStatus | undefined {
  if (tab === ALL_TICKET_STATUSES) return undefined;
  return TICKET_STATUS_OPTIONS.find((option) => option.label === tab)?.value;
}
