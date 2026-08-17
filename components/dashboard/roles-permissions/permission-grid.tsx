"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { GroupedPermissionDto } from "@/types/api/admin";

interface PermissionGridProps {
  /** Catalogue from `GET /api/admin/roles/permissions`, grouped by category. */
  groups: GroupedPermissionDto[];
  /** Ids of the currently assigned permissions. */
  value: string[];
  /** Omit to render the grid read-only. */
  onChange?: (next: string[]) => void;
  disabled?: boolean;
}

/**
 * Renders the permission catalogue as two balanced columns of checkboxes.
 *
 * Selection is by permission id, not label: the API assigns permissions by
 * UUID, and the category/permission names are its data to change.
 */
export function PermissionGrid({
  groups,
  value,
  onChange,
  disabled,
}: PermissionGridProps) {
  const selected = useMemo(() => new Set(value), [value]);
  const [left, right] = useMemo(() => splitIntoColumns(groups), [groups]);

  const toggle = (id: string) => {
    onChange?.(
      selected.has(id) ? value.filter((item) => item !== id) : [...value, id]
    );
  };

  const renderGroup = (group: GroupedPermissionDto, index: number) => (
    <div key={group.category ?? index} className="mb-5">
      <h4 className="mb-2.5 text-sm font-semibold text-foreground">
        {group.category ?? "Other"}
      </h4>
      <div className="space-y-3">
        {(group.permissions ?? []).map((permission) => {
          if (!permission.id) return null;
          const id = `perm-${permission.id}`;

          return (
            <div key={permission.id} className="flex items-center gap-2.5">
              <Checkbox
                id={id}
                checked={selected.has(permission.id)}
                disabled={disabled || !onChange}
                onCheckedChange={() => toggle(permission.id!)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:hover:bg-primary/80"
              />
              <Label
                htmlFor={id}
                title={permission.description ?? undefined}
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                {permission.name ?? permission.id}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      <div>{left.map(renderGroup)}</div>
      <div>{right.map(renderGroup)}</div>
    </div>
  );
}

/**
 * Splits categories across two columns of roughly equal height. The number of
 * categories comes from the API, so the old fixed `slice(0, 4)` would leave one
 * column empty or overlong as the catalogue grows.
 */
function splitIntoColumns(groups: GroupedPermissionDto[]) {
  const total = groups.reduce(
    (count, group) => count + (group.permissions?.length ?? 0),
    0
  );

  const left: GroupedPermissionDto[] = [];
  const right: GroupedPermissionDto[] = [];
  let filled = 0;

  for (const group of groups) {
    const size = group.permissions?.length ?? 0;

    // Categories stay whole; the first one always lands left so a single
    // oversized category doesn't push everything into the right column.
    if (left.length === 0 || filled + size <= total / 2) {
      left.push(group);
      filled += size;
    } else {
      right.push(group);
    }
  }

  return [left, right] as const;
}
