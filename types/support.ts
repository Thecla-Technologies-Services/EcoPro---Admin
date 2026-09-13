/**
 * A support ticket as the table renders it.
 *
 * Mapped from `SupportTicketDto` in `lib/adapters/support.ts`. The endpoint
 * reports what was raised and when, but nothing about who raised it — there is
 * no reporter id or name in the DTO — so the table names the category, not a
 * person.
 */
export interface SupportTicket {
  /** The API's GUID, which the resolve endpoint takes. */
  id: string;
  category: string;
  description: string;
  /** Absent when the reporter attached nothing. */
  attachmentUrl?: string;
  /** The API's own vocabulary — see `SupportTicketStatus`. */
  status: string;
  date: string;
  reviewedDate?: string;
}

/**
 * A feature suggestion as the table renders it.
 *
 * Read-only: the admin API lists suggestions but exposes no endpoint that
 * changes one, so there are no row actions to offer.
 */
export interface FeatureSuggestion {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
}
