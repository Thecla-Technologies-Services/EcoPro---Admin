"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  IoEyeOutline,
  IoPersonRemoveOutline,
  IoPersonAddOutline,
  IoTrashBinOutline,
} from "react-icons/io5";
import { TrendingUp, TrendingDown } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { DataState } from "@/components/shared/data-state";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSearchInput } from "@/components/shared/table-search-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaginationState } from "@tanstack/react-table";
import type { User, ModalType } from "@/types/user";
import { USER_FILTER_TABS } from "@/lib/adapters/user";

interface UserTableProps {
  data: User[];
  onOpenModal: (user: User, type: ModalType) => void;
  /**
   * Search, tab and page state are owned by the page because the API does the
   * filtering and paging — this component only reports the interaction.
   */
  search: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  totalPages?: number;
  totalCount?: number;
  filterCounts?: Record<string, number>;
  isLoading?: boolean;
  /**
   * Dropped when the list is already pinned to one account kind — the roles
   * module's staff accounts have nothing to filter between.
   */
  showFilterTabs?: boolean;
  rowLabel?: string;
  /**
   * Accessor keys to leave out, for a list whose source has no value for them —
   * staff accounts carry no wallet balance or eco-points, and a column of zeroes
   * reads as real data.
   */
  hiddenColumns?: readonly string[];
}

export function UserTable({
  data,
  onOpenModal,
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  pagination,
  onPaginationChange,
  totalPages,
  totalCount,
  filterCounts,
  isLoading,
  showFilterTabs = true,
  rowLabel = "users",
  hiddenColumns,
}: UserTableProps) {

  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: "id",
      header: "SN",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {/* Numbered by position rather than from the row's own `sn`: staff
              accounts are dropped after the server has numbered the page, so
              `sn` arrives with gaps (a page whose first rows were admins would
              otherwise start at 6). This keeps the column aligned with the
              "Showing 1–5 of …" summary underneath. */}
          <span className="text-sm text-gray-500">
            {pagination.pageIndex * pagination.pageSize + row.index + 1}.
          </span>
          {/* The list endpoint sends no trend direction, so the arrow only
              appears if one is ever supplied. */}
          {row.original.trend === "up" ? (
            <TrendingUp className="w-4 h-4 text-[#1A866C]" />
          ) : row.original.trend === "down" ? (
            <TrendingDown className="w-4 h-4 text-[#FF0000]" />
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
            <AvatarFallback className="text-xs font-bold bg-muted">
              {row.original.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-900">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <StatusBadge status={row.original.role} />,
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-primary italic">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          ₦{row.original.balance.toLocaleString()}.00
        </span>
      ),
    },
    {
      accessorKey: "ecoPoints",
      header: "Eco-Points",
      cell: ({ row }) => (
        <span className="text-sm flex items-center gap-1">
          <span className="text-green-500">🌿</span>
          {row.original.ecoPoints.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "listed",
      header: "Listed",
      cell: ({ row }) =>
        // The API's user summary carries no "listed" flag.
        row.original.listed === undefined ? (
          <span className="text-sm text-gray-400">—</span>
        ) : (
          <StatusBadge status={row.original.listed ? "Yes" : "No"} />
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const isSuspended = user.status === "Suspended";
        return (
          <RowActions>
            <RowActions.Item
              icon={IoEyeOutline}
              onSelect={() => onOpenModal(user, "view")}
            >
              View Account
            </RowActions.Item>
            {isSuspended ? (
              <RowActions.Item
                icon={IoPersonAddOutline}
                onSelect={() => onOpenModal(user, "unsuspend")}
              >
                Unsuspend Account
              </RowActions.Item>
            ) : (
              <RowActions.Item
                icon={IoPersonRemoveOutline}
                onSelect={() => onOpenModal(user, "suspend")}
              >
                Suspend Account
              </RowActions.Item>
            )}
            <RowActions.Item
              icon={IoTrashBinOutline}
              destructive
              onSelect={() => onOpenModal(user, "delete")}
            >
              Delete Account
            </RowActions.Item>
          </RowActions>
        );
      },
    },
  ];

  const visibleColumns = hiddenColumns?.length
    ? columns.filter((column) => {
        const key =
          "accessorKey" in column ? String(column.accessorKey) : column.id;
        return !key || !hiddenColumns.includes(key);
      })
    : columns;

  return (
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
      {/* Dim rather than unmount while a page or tab change is in flight, so the
          table doesn't collapse and jump the layout on every interaction. */}
      <DataState.Content busy={isLoading}>
        <DataTable
          columns={visibleColumns}
          data={data}
          pageSize={pagination.pageSize}
          rowLabel={rowLabel}
          hideSortIcon={["actions"]}
          filterTabs={showFilterTabs ? USER_FILTER_TABS : undefined}
          allTabValue="All Users"
          filterCounts={filterCounts}
          activeTab={activeTab}
          onTabChange={onTabChange}
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
  );
}
