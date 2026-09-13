"use client";

import { useUsers } from "@/hooks/admin/use-users";
import {
  useListPanel,
  type ListPanelState,
} from "@/hooks/shared/use-list-panel";
import {
  USER_TAB_PARAMS,
  toUserRow,
  type UserFilterTab,
} from "@/lib/adapters/user";
import type { AdminUserMetricsDto } from "@/types/api/admin";
import type { User } from "@/types/user";

const DEFAULT_TAB: UserFilterTab = "All Users";

/**
 * The `Role` value that selects staff accounts — a `UserType` member, spelled as
 * the swagger spells it.
 */
const ADMIN_ROLE_PARAM = "Admin";

/** What `UsersPanel` needs, whoever assembled it. */
export type UsersPanelState = ListPanelState<User, AdminUserMetricsDto> & {
  metrics?: AdminUserMetricsDto;
};

/**
 * The platform users list: `GET /api/admin/users`, paged and searched by the API.
 *
 * `metrics` is returned rather than rendered because the Users page needs it for
 * its stat cards, and because the filter counts come from it.
 *
 * `excludeAdmins` is the endpoint's own `ExcludeAdmins` parameter, so the server
 * both filters and counts — a full page of rows, and a total that matches them.
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
          excludeAdmins: excludeAdmins || undefined,
        },
      );

      const page = query.data?.users;

      return {
        rows: page?.data ?? [],
        meta: query.data?.metrics,
        totalPages: page?.totalPages,
        totalCount: page?.totalRecords,
        isPending: query.isPending,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: () => void query.refetch(),
      };
    },
    toRow: toUserRow,
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
 * The staff accounts list for the roles module: `GET /api/admin/users?Role=Admin`.
 *
 * Paged and searched by the API, like the platform list. This used to read the
 * identity service's whole user list and narrow it here, because the admin users
 * endpoint had no way to ask for staff; it since grew a `Role` parameter, and
 * asking the server is both correct and cheaper than filtering every account on
 * the platform in the browser.
 */
export function useAdminUsersPanel({
  pageSize,
}: { pageSize?: number } = {}): UsersPanelState {
  return useListPanel({
    pageSize,
    useQuery: ({ pagination, search }) => {
      // No `Tab`: the list is already pinned to one role, and the tab values
      // (All / Individual / NGO / Delivery / Suspended) have nothing to say
      // about staff accounts.
      const query = useUsers(undefined, {
        role: ADMIN_ROLE_PARAM,
        // Sent explicitly rather than left to the endpoint's default, which is
        // undocumented: if it excludes staff, asking for `Role=Admin` and
        // saying nothing here would return an empty list.
        excludeAdmins: false,
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        searchTerm: search || undefined,
      });

      const page = query.data?.users;

      return {
        rows: page?.data ?? [],
        totalPages: page?.totalPages,
        totalCount: page?.totalRecords,
        isPending: query.isPending,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: () => void query.refetch(),
      };
    },
    toRow: toUserRow,
  });
}
