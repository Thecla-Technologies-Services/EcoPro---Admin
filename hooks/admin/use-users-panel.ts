"use client";

import { useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { useAdminUsers } from "@/hooks/admin/use-admin-users";
import { useUsers } from "@/hooks/admin/use-users";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  USER_TAB_PARAMS,
  isAdminRole,
  toUserRow,
  type UserFilterTab,
} from "@/lib/adapters/user";
import type { AdminUserMetricsDto } from "@/types/api/admin";
import type { User } from "@/types/user";

const DEFAULT_PAGE_SIZE = 10;

/** What `UsersPanel` needs, whoever assembled it. */
export interface UsersPanelState {
  rows: User[];
  metrics?: AdminUserMetricsDto;
  query: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
  table: {
    data: User[];
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
  };
}

/** Tab, debounced search and page — shared by both panels below. */
function usePanelControls(pageSize: number) {
  const [activeTab, setActiveTab] = useState<UserFilterTab>("All Users");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  return {
    activeTab,
    search,
    debouncedSearch: useDebouncedValue(search),
    pagination,
    setPagination,
    changeTab: (tab: string) => {
      setActiveTab(tab as UserFilterTab);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    changeSearch: (value: string) => {
      setSearch(value);
      // A new search invalidates the current page position.
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
  };
}

/**
 * The platform users list: `GET /api/admin/users`, paged and searched by the API.
 *
 * `metrics` is returned rather than rendered because the Users page needs it for
 * its stat cards.
 */
export function useUsersPanel({
  excludeAdmins = false,
  pageSize = DEFAULT_PAGE_SIZE,
}: { excludeAdmins?: boolean; pageSize?: number } = {}): UsersPanelState {
  const controls = usePanelControls(pageSize);
  const { activeTab, search, debouncedSearch, pagination } = controls;

  const query = useUsers(USER_TAB_PARAMS[activeTab], {
    // The API pages from 1; the table indexes from 0.
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    searchTerm: debouncedSearch || undefined,
  });

  const page = query.data?.users;
  const metrics = query.data?.metrics;

  const rows = useMemo(() => {
    const mapped = (page?.data ?? []).map(toUserRow);
    // The endpoint has no filter that excludes staff accounts, so they are
    // dropped here — which is why a page can come back short.
    return excludeAdmins ? mapped.filter((row) => !isAdminRole(row.role)) : mapped;
  }, [page?.data, excludeAdmins]);

  return {
    rows,
    metrics,
    query: {
      isPending: query.isPending,
      isError: query.isError,
      error: query.error,
      refetch: () => void query.refetch(),
    },
    table: {
      data: rows,
      search,
      onSearchChange: controls.changeSearch,
      activeTab,
      onTabChange: controls.changeTab,
      pagination,
      onPaginationChange: controls.setPagination,
      totalPages: page?.totalPages,
      // CAVEAT: with `excludeAdmins` the server still counts staff accounts in
      // `totalRecords`, so the row summary can read a little high. Correcting it
      // needs a list filter the API doesn't expose.
      totalCount: page?.totalRecords,
      filterCounts: {
        Individual: metrics?.individualCount ?? 0,
        NGO: metrics?.ngoPartners ?? 0,
        Delivery: metrics?.deliveryPartners ?? 0,
        Suspended: metrics?.suspendedCount ?? 0,
      },
      isLoading: query.isPending || query.isFetching,
    },
  };
}

/**
 * The staff accounts list for the roles module.
 *
 * `GET /api/user/get-all` accepts no pagination or search, so both happen here
 * over the full set. The counts and row numbers are therefore exact — unlike the
 * platform list, nothing is being filtered out from under the server's totals.
 */
export function useAdminUsersPanel({
  pageSize = DEFAULT_PAGE_SIZE,
}: { pageSize?: number } = {}): UsersPanelState {
  const controls = usePanelControls(pageSize);
  const { search, debouncedSearch, pagination } = controls;

  const query = useAdminUsers();

  const matching = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    const all = query.data ?? [];
    if (!term) return all;

    return all.filter((row) =>
      [row.name, row.email, row.code].some((field) =>
        field?.toLowerCase().includes(term),
      ),
    );
  }, [query.data, debouncedSearch]);

  const rows = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return matching.slice(start, start + pagination.pageSize);
  }, [matching, pagination.pageIndex, pagination.pageSize]);

  return {
    rows,
    query: {
      isPending: query.isPending,
      isError: query.isError,
      error: query.error,
      refetch: () => void query.refetch(),
    },
    table: {
      data: rows,
      search,
      onSearchChange: controls.changeSearch,
      activeTab: controls.activeTab,
      onTabChange: controls.changeTab,
      pagination,
      onPaginationChange: controls.setPagination,
      totalPages: Math.max(1, Math.ceil(matching.length / pagination.pageSize)),
      totalCount: matching.length,
      isLoading: query.isPending || query.isFetching,
    },
  };
}
