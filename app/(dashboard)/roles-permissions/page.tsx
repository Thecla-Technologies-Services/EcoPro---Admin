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
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import { DataState } from "@/components/shared/data-state";
import { FilterTabs } from "@/components/shared/filter-tabs";
import SharedStatCard from "@/components/shared/stat-card";
import { PermissionsTable } from "@/components/dashboard/roles-permissions/roles-table";
import { CreateRoleDialog } from "@/components/dashboard/roles-permissions/create-role-dialog";
import { UsersPanel } from "@/components/dashboard/user/users-panel";
import { useRoles } from "@/hooks/admin/use-roles";
import { useAdminUsersPanel } from "@/hooks/admin/use-users-panel";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useTabParam } from "@/hooks/use-tab-param";
import { toRoleRow } from "@/lib/adapters/role";

const DEFAULT_PAGE_SIZE = 10;

/** `roles` is first, so it stays the tab a bare /roles-permissions link opens. */
const TABS = ["roles", "admin-users"] as const;

export default function RolesPermissionsPage() {
  const [tab, setTab] = useTabParam(TABS);

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

  // Staff accounts come from the identity service, since the admin users list
  // has no tab for them — so there is nothing for the table's own account-kind
  // filters to switch between either.
  const adminUsers = useAdminUsersPanel();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // A new search invalidates the current page position.
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-6">
      <PageHeader className="md:items-center">
        <PageHeader.Heading>
          <PageHeader.Title className="md:text-2xl">
            Roles &amp; Permissions
          </PageHeader.Title>
        </PageHeader.Heading>
        {/* Scoped to the roles tab — on Admin Users it would read as though it
            adds an admin, which it doesn't. */}
        {tab === "roles" && (
          <PageHeader.Actions>
            <Button
              onClick={() => setOpenCreate(true)}
              className="bg-primary text-white gap-2 rounded-full px-5"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </Button>
          </PageHeader.Actions>
        )}
      </PageHeader>

      {/* NOTE: RoleMetricsDto only carries `totalRoles` alongside three
          swap-shaped counters (pendingPickup / inTransit / completed). They are
          surfaced as the API names them rather than relabelled into something
          they aren't. */}
      <StatGrid className="gap-4">
        <SharedStatCard
          label="Total Roles"
          value={metrics?.totalRoles ?? 0}
          icon={IoPeopleOutline}
          isLoading={isPending}
        />
        <SharedStatCard
          label="Pending Pickup"
          value={metrics?.pendingPickup ?? 0}
          icon={HiOutlineBuildingOffice2}
          isLoading={isPending}
        />
        <SharedStatCard
          label="In Transit"
          value={metrics?.inTransit ?? 0}
          icon={IoCartOutline}
          isLoading={isPending}
        />
        <SharedStatCard
          label="Completed"
          value={metrics?.completed ?? 0}
          icon={IoPersonRemoveOutline}
          isLoading={isPending}
        />
      </StatGrid>

      <FilterTabs value={tab} onChange={(next) => setTab(next as typeof tab)}>
        <FilterTabs.Tab value="roles">Roles &amp; Permissions</FilterTabs.Tab>
        <FilterTabs.Tab value="admin-users">Admin Users</FilterTabs.Tab>
      </FilterTabs>

      {tab === "admin-users" ? (
        <UsersPanel
          panel={adminUsers}
          showFilterTabs={false}
          rowLabel="admin users"
          // Balance, eco-points and listed have no source for a staff account —
          // the identity service carries none of them, so they would only ever
          // render zeroes and placeholders. Code is dropped as noise here.
          hiddenColumns={["code", "balance", "ecoPoints", "listed"]}
          showChangePassword
        />
      ) : (
        <DataState>
          <DataState.Error
            when={isError}
            error={error}
            onRetry={() => refetch()}
          />
          <DataState.Content>
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
          </DataState.Content>
        </DataState>
      )}

      <CreateRoleDialog open={openCreate} onOpenChange={setOpenCreate} />
    </div>
  );
}
