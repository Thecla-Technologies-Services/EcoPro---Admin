import type { GroupedPermissionDto, RoleSummaryDto } from "@/types/api/admin";
import type { RoleRow } from "@/types/permission";

/** Maps a row from `GET /api/admin/roles` onto the shape the table renders. */
export function toRoleRow(dto: RoleSummaryDto): RoleRow {
  return {
    id: dto.id ?? "",
    sn: dto.sn,
    name: dto.name ?? "Unnamed role",
    description: dto.description ?? "—",
    permissionSummary: dto.permissionSummary ?? "—",
    // Absent means "not stated"; treating that as locked would hide the edit
    // action on every role the API forgets to flag.
    isEditable: dto.isEditable ?? true,
    createdAt: dto.createdAt,
  };
}

/**
 * Narrows the catalogue to the categories a role actually holds, so the view
 * dialog lists what was granted instead of a mostly-unchecked master list.
 */
export function selectedGroups(
  groups: GroupedPermissionDto[] = [],
  assignedIds: string[] = []
): GroupedPermissionDto[] {
  const assigned = new Set(assignedIds);

  return groups
    .map((group) => ({
      ...group,
      permissions: (group.permissions ?? []).filter(
        (permission) => permission.id && assigned.has(permission.id)
      ),
    }))
    .filter((group) => group.permissions.length > 0);
}

/** Formats a role's `createdAt` for the table, tolerating an absent value. */
export function formatRoleDate(iso: string | undefined): string {
  if (!iso) return "—";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
