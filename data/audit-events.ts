import type { AuditEvent } from "@/types/audit-event";

/**
 * Stand-in rows for an audit endpoint the Admin API does not document. Written
 * to cover every `AuditArea` and both a destructive and a routine action per
 * area, so the tabs and the search have something to tell apart.
 *
 * `performedAt` is a local timestamp rather than a phrase like "2 hours ago":
 * the header's date filter compares against it, and a display string cannot be
 * compared. They span six days so a week-long range narrows the list instead of
 * either emptying it or leaving it whole.
 */
export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "1",
    actor: { name: "Adejoke Ibrahim", email: "adejoke@ecopro.com" },
    action: "Approved withdrawal",
    area: "Wallet",
    target: "WD-53156908",
    performedAt: "2026-09-14T09:12:00",
    ipAddress: "102.89.34.17",
  },
  {
    id: "2",
    actor: { name: "Tobi Adams", email: "tobi@ecopro.com" },
    action: "Suspended user",
    area: "Users",
    target: "USR-8301",
    performedAt: "2026-09-14T07:40:00",
    ipAddress: "102.89.12.204",
  },
  {
    id: "3",
    actor: { name: "Tobi Adams", email: "tobi@ecopro.com" },
    action: "Rejected withdrawal",
    area: "Wallet",
    target: "WD-53156774",
    performedAt: "2026-09-14T05:15:00",
    ipAddress: "102.89.12.204",
  },
  {
    id: "4",
    actor: { name: "Ngozi Eze", email: "ngozi@ecopro.com" },
    action: "Approved verification",
    area: "Verification",
    target: "VR-20455",
    performedAt: "2026-09-13T16:12:00",
    ipAddress: "197.210.76.88",
  },
  {
    id: "5",
    actor: { name: "Ngozi Eze", email: "ngozi@ecopro.com" },
    action: "Declined verification",
    area: "Verification",
    target: "VR-20441",
    performedAt: "2026-09-13T15:58:00",
    ipAddress: "197.210.76.88",
  },
  {
    id: "6",
    actor: { name: "Adejoke Ibrahim", email: "adejoke@ecopro.com" },
    action: "Removed listing",
    area: "Listings",
    target: "LST-74120",
    performedAt: "2026-09-13T13:05:00",
    ipAddress: "102.89.34.17",
  },
  {
    id: "7",
    actor: { name: "Chinedu Okafor", email: "chinedu@ecopro.com" },
    action: "Flagged listing",
    area: "Listings",
    target: "LST-74098",
    performedAt: "2026-09-13T11:40:00",
    ipAddress: "105.112.9.61",
  },
  {
    id: "8",
    actor: { name: "Chinedu Okafor", email: "chinedu@ecopro.com" },
    action: "Resolved dispute",
    area: "Disputes",
    target: "DSP-3391",
    performedAt: "2026-09-12T17:20:00",
    ipAddress: "105.112.9.61",
  },
  {
    id: "9",
    actor: { name: "Adejoke Ibrahim", email: "adejoke@ecopro.com" },
    action: "Refunded buyer",
    area: "Disputes",
    target: "DSP-3384",
    performedAt: "2026-09-12T14:33:00",
    ipAddress: "102.89.34.17",
  },
  {
    id: "10",
    actor: { name: "Tobi Adams", email: "tobi@ecopro.com" },
    action: "Reinstated user",
    area: "Users",
    target: "USR-7742",
    performedAt: "2026-09-12T10:02:00",
    ipAddress: "102.89.12.204",
  },
  {
    id: "11",
    actor: { name: "Ngozi Eze", email: "ngozi@ecopro.com" },
    action: "Created admin account",
    area: "Users",
    target: "USR-8402",
    performedAt: "2026-09-11T16:47:00",
    ipAddress: "197.210.76.88",
  },
  {
    id: "12",
    actor: { name: "Adejoke Ibrahim", email: "adejoke@ecopro.com" },
    action: "Changed payout threshold",
    area: "Settings",
    target: "Payout settings",
    performedAt: "2026-09-11T09:15:00",
    ipAddress: "102.89.34.17",
  },
  {
    id: "13",
    actor: { name: "Chinedu Okafor", email: "chinedu@ecopro.com" },
    action: "Updated role permissions",
    area: "Settings",
    target: "Support Agent",
    performedAt: "2026-09-10T18:08:00",
    ipAddress: "105.112.9.61",
  },
  {
    id: "14",
    actor: { name: "Tobi Adams", email: "tobi@ecopro.com" },
    action: "Escalated dispute",
    area: "Disputes",
    target: "DSP-3370",
    performedAt: "2026-09-10T12:26:00",
    ipAddress: "102.89.12.204",
  },
  {
    id: "15",
    actor: { name: "Ngozi Eze", email: "ngozi@ecopro.com" },
    action: "Paused escrow release",
    area: "Wallet",
    target: "ESC-11208",
    performedAt: "2026-09-09T15:44:00",
    ipAddress: "197.210.76.88",
  },
];
