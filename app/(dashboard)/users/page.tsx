"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { MoreVertical } from "lucide-react";
import type { PaginationState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import SharedStatCard from "@/components/shared/stat-card";
import { UserTable } from "@/components/dashboard/user/user-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserActionModals } from "@/components/dashboard/user/user-modals";
import { ViewUserSheet } from "@/components/dashboard/user/view-sheet";
import { AddUserDialog } from "@/components/dashboard/user/add-user";
import { QueryError } from "@/components/shared/query-error";
import { useUsers } from "@/hooks/admin/use-users";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  USER_TAB_PARAMS,
  toUserRow,
  type UserFilterTab,
} from "@/lib/adapters/user";
import type { User, ModalType } from "@/types/user";
import {
  IoPeopleOutline,
  IoCartOutline,
  IoPersonRemoveOutline,
  IoPersonAddOutline,
} from "react-icons/io5";

const DEFAULT_PAGE_SIZE = 10;

export default function UsersManagementPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [addOpen, setAddOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<UserFilterTab>("All Users");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const debouncedSearch = useDebouncedValue(search);

  const { data, isPending, isFetching, isError, error, refetch } = useUsers(
    USER_TAB_PARAMS[activeTab],
    {
      // The API pages from 1; the table indexes from 0.
      pageNumber: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      searchTerm: debouncedSearch || undefined,
    }
  );

  const metrics = data?.metrics;
  const page = data?.users;

  const rows = useMemo(
    () => (page?.data ?? []).map(toUserRow),
    [page?.data]
  );

  const stats = [
    {
      label: "Total Users",
      value: metrics?.totalUsers ?? 0,
      icon: IoPeopleOutline,
      delay: 0.1,
    },
    {
      label: "NGO Partners",
      value: metrics?.ngoPartners ?? 0,
      icon: HiOutlineBuildingOffice2,
      delay: 0.2,
    },
    {
      label: "Delivery Partners",
      value: metrics?.deliveryPartners ?? 0,
      icon: IoCartOutline,
      delay: 0.3,
    },
    {
      label: "Suspended",
      value: metrics?.suspendedCount ?? 0,
      icon: IoPersonRemoveOutline,
      delay: 0.4,
    },
  ];

  const filterCounts = {
    Individual: metrics?.individualCount ?? 0,
    NGO: metrics?.ngoPartners ?? 0,
    Delivery: metrics?.deliveryPartners ?? 0,
    Suspended: metrics?.suspendedCount ?? 0,
  };

  const openModal = (user: User, type: ModalType) => {
    setSelectedUser(user);
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as UserFilterTab);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // A new search invalidates the current page position.
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-primary flex-1 md:flex-none text-white gap-2 rounded-full px-5"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add New User
          </Button>
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
              <DropdownMenuItem className="rounded-sm">
                <IoPersonAddOutline className="size-4 md:size-5 mr-2" />
                Add NGO
              </DropdownMenuItem>

              <DropdownMenuItem className="rounded-sm">
                <IoPeopleOutline className="size-4 md:size-5 mr-2" />
                Add Delivery Partner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <FadeIn delay={s.delay} key={s.label}>
            <SharedStatCard label={s.label} value={s.value} icon={s.icon} />
          </FadeIn>
        ))}
      </div>

      {/* Search + Table */}
      {isError ? (
        <QueryError error={error} onRetry={() => refetch()} />
      ) : (
        <UserTable
          data={rows}
          onOpenModal={openModal}
          search={search}
          onSearchChange={handleSearchChange}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={page?.totalPages}
          totalCount={page?.totalRecords}
          filterCounts={filterCounts}
          isLoading={isPending || isFetching}
        />
      )}

      {/* Modals */}
      {selectedUser && (
        <UserActionModals
          user={selectedUser}
          modal={modal}
          onClose={closeModal}
        />
      )}

      {/* View / Edit sheet */}
      {selectedUser && (modal === "view" || modal === "edit") ? (
        <ViewUserSheet
          user={selectedUser}
          open
          onClose={closeModal}
          editMode={modal === "edit"}
          onEdit={() => setModal("edit")}
        />
      ) : null}

      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
