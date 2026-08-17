"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { PaginationState } from "@tanstack/react-table";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import {
  IoPeopleOutline,
  IoCartOutline,
  IoPersonRemoveOutline,
} from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import SharedStatCard from "@/components/shared/stat-card";
import { QueryError } from "@/components/shared/query-error";
import { PermissionsTable } from "@/components/dashboard/roles-permissions/roles-table";
import { CreateRoleDialog } from "@/components/dashboard/roles-permissions/create-role-dialog";
import { useRoles } from "@/hooks/admin/use-roles";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toRoleRow } from "@/lib/adapters/role";

const DEFAULT_PAGE_SIZE = 10;

export default function RolesPermissionsPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const debouncedSearch = useDebouncedValue(search);

  const { data, isPending, isFetching, isError, error, refetch } = useRoles({
    // The API pages from 1; the table indexes from 0.
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    searchTerm: debouncedSearch || undefined,
  });

  const metrics = data?.metrics;
  const page = data?.roles;

  const rows = useMemo(() => (page?.data ?? []).map(toRoleRow), [page?.data]);

  // NOTE: RoleMetricsDto only carries `totalRoles` alongside three swap-shaped
  // counters (pendingPickup / inTransit / completed). They are surfaced as the
  // API names them rather than relabelled into something they aren't.
  const stats = [
    {
      label: "Total Roles",
      value: metrics?.totalRoles ?? 0,
      icon: IoPeopleOutline,
      delay: 0.1,
    },
    {
      label: "Pending Pickup",
      value: metrics?.pendingPickup ?? 0,
      icon: HiOutlineBuildingOffice2,
      delay: 0.2,
    },
    {
      label: "In Transit",
      value: metrics?.inTransit ?? 0,
      icon: IoCartOutline,
      delay: 0.3,
    },
    {
      label: "Completed",
      value: metrics?.completed ?? 0,
      icon: IoPersonRemoveOutline,
      delay: 0.4,
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // A new search invalidates the current page position.
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles &amp; Permissions</h1>
        </div>
        <Button
          onClick={() => setOpenCreate(true)}
          className="bg-primary text-white gap-2 rounded-full px-5"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </Button>
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
        <PermissionsTable
          data={rows}
          search={search}
          onSearchChange={handleSearchChange}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={page?.totalPages}
          totalCount={page?.totalRecords}
          isLoading={isPending || isFetching}
        />
      )}

      <CreateRoleDialog open={openCreate} onOpenChange={setOpenCreate} />
    </div>
  );
}
