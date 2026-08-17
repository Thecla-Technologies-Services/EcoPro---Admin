"use client";

import { useState } from "react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { MoreVertical, Search } from "lucide-react";
import {
  IoEyeOutline,
  IoTrashBinOutline,
  IoCreateOutline,
} from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/shared/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background rounded-md"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 gap-3 justify-start md:w-56 rounded-md p-3"
            >
              <DropdownMenuItem
                className="rounded-sm"
                onClick={() => openAction(role, "view")}
              >
                <IoEyeOutline className="size-4 md:size-5 mr-2" />
                View Role
              </DropdownMenuItem>
              {/* System roles are locked upstream, so the mutating actions are
                  hidden rather than left to fail on submit. */}
              {role.isEditable && (
                <>
                  <DropdownMenuItem
                    className="rounded-sm"
                    onClick={() => openAction(role, "edit")}
                  >
                    <IoCreateOutline className="size-4 md:size-5 mr-2" />
                    Edit Role
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-sm text-destructive focus:text-destructive"
                    onClick={() => openAction(role, "delete")}
                  >
                    <IoTrashBinOutline className="size-4 md:size-5 mr-2" />
                    Delete Role
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading && !data.length) {
    return (
      <div className="bg-white space-y-3 py-4" aria-busy>
        <Skeleton className="h-9 w-full max-w-md" />
        {Array.from({ length: pagination.pageSize }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div
        aria-busy={isLoading}
        // Dim rather than unmount while a page or search change is in flight,
        // so the table doesn't collapse and jump the layout.
        className={isLoading ? "opacity-60 transition-opacity" : undefined}
      >
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
            <div className="relative mt-5 md:mt-3 w-full md:w-60 ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-9 h-9 focus-within:border-primary outline:none focus-within:ring-0 focus-within:outline-0 focus-visible:border-primary ring-0 rounded-md md:rounded-lg text-sm"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          }
        />
      </div>

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
