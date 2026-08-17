"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/shared/query-error";
import { PermissionGrid } from "./permission-grid";
import { useRole } from "@/hooks/admin/use-roles";
import { formatRoleDate, selectedGroups } from "@/lib/adapters/role";
import type { RoleRow } from "@/types/permission";

interface ViewRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleRow;
}

/** Read-only detail from `GET /api/admin/roles/{roleId}`. */
export function ViewRoleDialog({
  open,
  onOpenChange,
  role,
}: ViewRoleDialogProps) {
  const { data, isPending, isError, error, refetch } = useRole(
    open ? role.id : undefined
  );

  const assigned = data?.assignedPermissionIds ?? [];
  // The detail response carries its own grouped catalogue, so no second fetch
  // is needed just to name the permissions this role holds.
  const groups = selectedGroups(data?.groupedPermissions ?? [], assigned);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {data?.name ?? role.name}
          </DialogTitle>
          <DialogDescription>
            {data?.description ?? role.description}
          </DialogDescription>
        </DialogHeader>

        {isError ? (
          <QueryError error={error} onRetry={() => refetch()} />
        ) : isPending ? (
          <div className="space-y-3" aria-busy>
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-4 border-b pb-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Permissions</dt>
                <dd className="font-medium">{assigned.length}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">
                  {data?.isEditable ? "Custom" : "System"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {formatRoleDate(data?.createdAt)}
                </dd>
              </div>
            </dl>

            <div className="max-h-[50vh] overflow-y-auto pr-1">
              {groups.length ? (
                <PermissionGrid groups={groups} value={assigned} />
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  This role has no permissions assigned.
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
