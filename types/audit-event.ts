/**
 * One administrative action, as the audit log renders it.
 *
 * No endpoint serves these yet — the Admin API documents no audit or activity
 * resource — so the rows come from `data/audit-events.ts`. The shape is what
 * the table needs rather than a DTO mapped from anywhere, and gets an adapter
 * when there is something to adapt.
 */
export interface AuditEvent {
  id: string;
  /** The admin who performed it. */
  actor: { name: string; email: string };
  /** What they did, in the product's own words — "Approved withdrawal". */
  action: string;
  /** Which part of the dashboard it happened in; the tabs filter by this. */
  area: AuditArea;
  /**
   * The record acted on, as the reference an admin can quote and search for —
   * `WD-53156908`, `USR-8301` — not the uuid the endpoints are addressed by.
   */
  target: string;
  /**
   * When it happened, as a timestamp — not the phrase the column shows. The
   * date filter compares against this, and `formatDateTime` renders it.
   */
  performedAt: string;
  ipAddress: string;
}

export type AuditArea =
  | "Users"
  | "Listings"
  | "Wallet"
  | "Verification"
  | "Disputes"
  | "Settings";
