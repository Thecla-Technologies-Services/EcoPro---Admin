"use client";

import { useAdminUsers } from "@/hooks/admin/use-admin-users";
import { useUsers } from "@/hooks/admin/use-users";
import {
  useListPanel,
  type ListPanelState,
} from "@/hooks/shared/use-list-panel";
import {
  USER_TAB_PARAMS,
  isAdminRole,
  toUserRow,
  type UserFilterTab,
} from "@/lib/adapters/user";
import type { AdminUserMetricsDto } from "@/types/api/admin";
import type { User } from "@/types/user";

const DEFAULT_TAB: UserFilterTab = "All Users";

/** What `UsersPanel` needs, whoever assembled it. */
export type UsersPanelState = ListPanelState<User, AdminUserMetricsDto> & {
  metrics?: AdminUserMetricsDto;
};

/**
 * The platform users list: `GET /api/admin/users`, paged and searched by the API.
 *
 * `metrics` is returned rather than rendered because the Users page needs it for
 * its stat cards, and because the filter counts come from it.
 */
export function useUsersPanel({
  excludeAdmins = false,
  pageSize,
}: { excludeAdmins?: boolean; pageSize?: number } = {}): UsersPanelState {
  const panel = useListPanel({
    pageSize,
    initialFilters: { tab: DEFAULT_TAB },
    useQuery: ({ pagination, search, filters }) => {
      const query = useUsers(
        USER_TAB_PARAMS[(filters.tab ?? DEFAULT_TAB) as UserFilterTab],
        {
          // The API pages from 1; the table indexes from 0.
          pageNumber: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          searchTerm: search || undefined,
        },
      );

      const page = query.data?.users;

      return {
        rows: page?.data ?? [],
        meta: query.data?.metrics,
        totalPages: page?.totalPages,
        // CAVEAT: with `excludeAdmins` the server still counts staff accounts
        // in `totalRecords`, so the row summary can read a little high.
        // Correcting it needs a list filter the API does not expose.
        totalCount: page?.totalRecords,
        isPending: query.isPending,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: () => void query.refetch(),
      };
    },
    toRow: toUserRow,
    // The endpoint has no filter that excludes staff accounts, so they are
    // dropped here — which is why a page can come back short.
    select: excludeAdmins
      ? (rows) => rows.filter((row) => !isAdminRole(row.role))
      : undefined,
  });

  /**
   * The counts come back through the panel rather than being captured while it
   * renders — the options object is built before the query runs, so nothing
   * read there would be populated yet.
   */
  const metrics = panel.meta;

  return {
    ...panel,
    metrics,
    table: {
      ...panel.table,
      filterCounts: {
        Individual: metrics?.individualCount ?? 0,
        NGO: metrics?.ngoPartners ?? 0,
        Delivery: metrics?.deliveryPartners ?? 0,
        Suspended: metrics?.suspendedCount ?? 0,
      },
    },
  };
}

/**
 * The staff accounts list for the roles module.
 *
 * `GET /api/user/get-all` accepts no pagination or search, so both happen in the
 * panel over the full set. The counts and row numbers are therefore exact —
 * unlike the platform list, nothing is being filtered out from under the
 * server's totals.
 */
export function useAdminUsersPanel({
  pageSize,
}: { pageSize?: number } = {}): UsersPanelState {
  return useListPanel({
    pageSize,
    paging: "client",
    useQuery: () => {
      const query = useAdminUsers();

      return {
        rows: query.data ?? [],
        isPending: query.isPending,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: () => void query.refetch(),
      };
    },
    toRow: (row: User) => row,
    matches: (row, term) =>
      [row.name, row.email, row.code].some((field) =>
        field?.toLowerCase().includes(term),
      ),
  });
}
