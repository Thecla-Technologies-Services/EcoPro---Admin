/** A row in the roles table, mapped from `RoleSummaryDto`. */
export interface RoleRow {
  id: string;
  /** Server-assigned serial number for the current page. */
  sn?: number;
  name: string;
  description: string;
  /** Pre-rendered permission blurb from the API, e.g. "12 permissions". */
  permissionSummary: string;
  /** System roles are locked — the API rejects edits and deletes on them. */
  isEditable: boolean;
  createdAt?: string;
}
