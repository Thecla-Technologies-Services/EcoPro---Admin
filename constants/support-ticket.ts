/**
 * The option lists a complaint is filed with.
 *
 * None of these are the API's: `SupportTicketDto` carries a category, a
 * description, a status and an attachment, and nothing else — no reporter, no
 * subject, no source, no priority and no assignee. The swagger documents no
 * category list either. So these are the product's vocabulary, written here
 * rather than inline in the form, and the values are what would be sent if an
 * endpoint took them.
 */

export const TICKET_CATEGORY_OPTIONS = [
  "Payment Issue",
  "Delivery Issue",
  "Listing Issue",
  "Swap Issue",
  "Account Issue",
  "Other",
] as const;

/** How the complaint reached the admin. */
export const TICKET_SOURCE_OPTIONS = [
  "Platform",
  "Email",
  "Phone",
  "Admin",
] as const;

export const TICKET_PRIORITY_OPTIONS = [
  "Low",
  "Medium",
  "High",
  "Urgent",
] as const;

/**
 * The statuses a complaint can be filed at.
 *
 * Four, where the API's `SupportTicketStatus` has three: "Closed" is the
 * product's, with no enum member behind it. Kept separate from
 * `TICKET_STATUS_OPTIONS` (`constants/support-ticket-status.ts`) for that
 * reason — those are the values the list and resolve endpoints accept.
 */
export const TICKET_FORM_STATUS_OPTIONS = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
] as const;
