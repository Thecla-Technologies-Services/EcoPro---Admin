"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import {
  IoEyeOutline,
  IoPersonRemoveOutline,
  IoPersonAddOutline,
  IoTrashBinOutline,
} from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
}: UserTableProps) {

  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: "id",
      header: "SN",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {row.original.sn ?? row.index + 1}.
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
                onClick={() => onOpenModal(user, "view")}
              >
                <IoEyeOutline className="size-4 md:size-5 mr-2" />
                View Account
              </DropdownMenuItem>
              {isSuspended ? (
                <DropdownMenuItem
                  className="rounded-sm"
                  onClick={() => onOpenModal(user, "unsuspend")}
                >
                  <IoPersonAddOutline className="size-4 md:size-5 mr-2" />
                  Unsuspend Account
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="rounded-sm"
                  onClick={() => onOpenModal(user, "suspend")}
                >
                  <IoPersonRemoveOutline className="size-4 md:size-5 mr-2" />
                  Suspend Account
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="rounded-sm text-destructive focus:text-destructive"
                onClick={() => onOpenModal(user, "delete")}
              >
                <IoTrashBinOutline className="size-4 md:size-5 mr-2" />
                Delete Account
              </DropdownMenuItem>
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
    <div
      aria-busy={isLoading}
      // Dim rather than unmount while a page or tab change is in flight, so the
      // table doesn't collapse and jump the layout on every interaction.
      className={isLoading ? "opacity-60 transition-opacity" : undefined}
    >
      <DataTable
      columns={columns}
      data={data}
      pageSize={pagination.pageSize}
      rowLabel="users"
      hideSortIcon={["actions"]}
      filterTabs={USER_FILTER_TABS}
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
        <div className="relative mt-5 md:mt-3 w-full md:w-60 ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-9 h-9 focus-within:border-primary outline:none focus-within:ring-0 focus-within:outline-0 focus-visible:border-primary ring-0 rounded-md md:rounded-lg text-sm"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      }
      />
    </div>
  );
}
