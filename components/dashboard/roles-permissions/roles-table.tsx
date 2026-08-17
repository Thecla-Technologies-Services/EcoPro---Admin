"use client";

import { useState } from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import {
  IoEyeOutline,
  IoTrashBinOutline,
  IoCreateOutline,
} from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/shared/data-table";
import { DataState } from "@/components/shared/data-state";
import { RowActions } from "@/components/shared/row-actions";
import { TableSearchInput } from "@/components/shared/table-search-input";
import { EditRoleDialog } from "./edit-role-dialog";
import { ViewRoleDialog } from "./view-role-dialog";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { formatRoleDate } from "@/lib/adapters/role";
import type { RoleRow } from "@/types/permission";

type RoleAction = "view" | "edit" | "delete";

interface PermissionTableProps {
  data: RoleRow[];
  /**
   * Search and page state are owned by the page because the API does the
   * filtering and paging — this component only reports the interaction.
   */
  search: string;
  onSearchChange: (value: string) => void;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  totalPages?: number;
  totalCount?: number;
  isLoading?: boolean;
}

export function PermissionsTable({
  data,
  search,
  onSearchChange,
  pagination,
  onPaginationChange,
  totalPages,
  totalCount,
  isLoading,
}: PermissionTableProps) {
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);
  const [action, setAction] = useState<RoleAction | null>(null);

  const openAction = (role: RoleRow, next: RoleAction) => {
    setSelectedRole(role);
    setAction(next);
  };

  const closeAction = () => {
    setAction(null);
    setSelectedRole(null);
  };

  const columns: ColumnDef<RoleRow, unknown>[] = [
    {
      accessorKey: "sn",
      header: "SN",
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.sn ?? row.index + 1}.
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span
          className="block max-w-xs truncate text-sm text-gray-600"
          title={row.original.description}
        >
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "permissionSummary",
      header: "Permission",
      cell: ({ row }) => (
        <span
          className="block max-w-sm truncate text-sm text-gray-600"
          title={row.original.permissionSummary}
        >
          {row.original.permissionSummary}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {formatRoleDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const role = row.original;

        return (
          <RowActions>
            <RowActions.Item
              icon={IoEyeOutline}
              onSelect={() => openAction(role, "view")}
            >
              View Role
            </RowActions.Item>
            {/* System roles are locked upstream, so the mutating actions are
                hidden rather than left to fail on submit. */}
            {role.isEditable && (
              <>
                <RowActions.Item
                  icon={IoCreateOutline}
                  onSelect={() => openAction(role, "edit")}
                >
                  Edit Role
                </RowActions.Item>
                <RowActions.Item
                  icon={IoTrashBinOutline}
                  destructive
                  onSelect={() => openAction(role, "delete")}
                >
                  Delete Role
                </RowActions.Item>
              </>
            )}
          </RowActions>
        );
      },
    },
  ];

  return (
    <div>
      <DataState>
        {/* First load has nothing to dim, so it gets placeholders instead. */}
        <DataState.Loading
          when={isLoading && !data.length}
          className="bg-white py-4"
        >
          <Skeleton className="h-9 w-full max-w-md" />
          {Array.from({ length: pagination.pageSize }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </DataState.Loading>
        {/* Dim rather than unmount while a page or search change is in flight,
            so the table doesn't collapse and jump the layout. */}
        <DataState.Content busy={isLoading}>
          <DataTable
            columns={columns}
            data={data}
            pageSize={pagination.pageSize}
            rowLabel="roles"
            hideSortIcon={["actions"]}
            manualPagination
            pagination={pagination}
            totalPages={totalPages}
            totalCount={totalCount}
            onPaginationChange={onPaginationChange}
            headerExtra={
              <TableSearchInput
                className="ml-auto"
                value={search}
                onChange={onSearchChange}
              />
            }
          />
        </DataState.Content>
      </DataState>

      {/* Keyed on the role id so each dialog mounts fresh per row. */}
      {selectedRole && action === "view" && (
        <ViewRoleDialog
          key={`view-${selectedRole.id}`}
          open
          onOpenChange={closeAction}
          role={selectedRole}
        />
      )}
      {selectedRole && action === "edit" && (
        <EditRoleDialog
          key={`edit-${selectedRole.id}`}
          open
          onOpenChange={closeAction}
          role={selectedRole}
        />
      )}
      {selectedRole && action === "delete" && (
        <DeleteRoleDialog
          key={`delete-${selectedRole.id}`}
          open
          onOpenChange={closeAction}
          role={selectedRole}
        />
      )}
    </div>
  );
}
