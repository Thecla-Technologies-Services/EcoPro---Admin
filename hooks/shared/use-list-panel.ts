"use client";

import { useCallback, useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const DEFAULT_PAGE_SIZE = 10;

/**
 * The values a list is scoped by. `undefined` means "not filtering by this",
 * which is what keeps an unset filter out of the query string.
 *
 * Deliberately opaque to the panel: it never interprets a key, it only knows
 * that changing one invalidates the page position. Each endpoint's own hook
 * already owns its parameter vocabulary.
 */
export type ListFilters = Record<string, string | undefined>;

/** What the panel hands its query on every render. */
export interface ListQueryParams {
  pagination: PaginationState;
  /** Debounced — a keystroke does not reach the endpoint. */
  search: string;
  filters: ListFilters;
}

/** What a query hands back, whichever endpoint it came from. */
export interface ListQueryResult<Dto, Meta = unknown> {
  rows: Dto[];
  /**
   * Anything the response carries besides the rows — the stat-card metrics,
   * typically. Opaque to the panel; passed straight back out so a page can read
   * it without the query having to be called twice or captured mid-render.
   */
  meta?: Meta;
  /** Server-paged lists report their own totals; client-paged ones omit them. */
  totalPages?: number;
  totalCount?: number;
  isPending: boolean;
  isFetching?: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/** What a list view needs, whoever assembled it. */
export interface ListPanelState<Row, Meta = unknown> {
  rows: Row[];
  /** Whatever the query reported alongside its rows. */
  meta?: Meta;
  query: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
  table: {
    data: Row[];
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
  /** Every filter currently applied, including `tab`. */
  filters: ListFilters;
  /** Sets one filter and returns to the first page. */
  setFilter: (key: string, value: string | undefined) => void;
}

interface ListPanelOptions<Dto, Row, Meta> {
  /**
   * The endpoint, as a hook. It receives the panel's current params and returns
   * a normalised result — which is where an endpoint's own response shape
   * (`data.users.data`, `data.listings.data`, a bare array) is unwrapped.
   */
  useQuery: (params: ListQueryParams) => ListQueryResult<Dto, Meta>;
  toRow: (dto: Dto) => Row;
  pageSize?: number;
  initialFilters?: ListFilters;
  /**
   * `"client"` for an endpoint that accepts neither paging nor search, so both
   * happen here over the full set.
   */
  paging?: "server" | "client";
  /** Client paging only: whether a row matches the search term. */
  matches?: (row: Row, term: string) => boolean;
  /**
   * Applied after mapping. For a list the API cannot narrow itself — dropping
   * staff accounts, say — which is why a server-paged page can come back short.
   */
  select?: (rows: Row[]) => Row[];
  filterCounts?: Record<string, number>;
}

/**
 * The tab, search and page position behind every list in the dashboard.
 *
 * Three pages were each writing this out: the same three `useState`s, the same
 * debounce, the same `pageIndex + 1` conversion for an API that pages from 1,
 * and a reset-to-first-page handler per filter — Listings had four of them.
 * Returning to page 1 whenever the result set changes is an invariant of this
 * module now, rather than a rule each page has to remember for each filter.
 *
 * ```tsx
 * const panel = useListPanel({
 *   useQuery: ({ pagination, search, filters }) => {
 *     const q = useListings(filters.tab, { pageNumber: pagination.pageIndex + 1, … });
 *     return { rows: q.data?.listings?.data ?? [], totalPages: …, ...q };
 *   },
 *   toRow: toListingRow,
 * });
 * ```
 */
export function useListPanel<Dto, Row, Meta = unknown>({
  useQuery,
  toRow,
  pageSize = DEFAULT_PAGE_SIZE,
  initialFilters = {},
  paging = "server",
  matches,
  select,
  filterCounts,
}: ListPanelOptions<Dto, Row, Meta>): ListPanelState<Row, Meta> {
  const [filters, setFilters] = useState<ListFilters>(initialFilters);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const debouncedSearch = useDebouncedValue(search);

  const toFirstPage = useCallback(
    () => setPagination((prev) => ({ ...prev, pageIndex: 0 })),
    [],
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      // The current page position describes a result set that no longer exists.
      toFirstPage();
    },
    [toFirstPage],
  );

  const changeSearch = useCallback(
    (value: string) => {
      setSearch(value);
      toFirstPage();
    },
    [toFirstPage],
  );

  const query = useQuery({ pagination, search: debouncedSearch, filters });

  const mapped = useMemo(() => {
    const rows = query.rows.map(toRow);
    return select ? select(rows) : rows;
    // `toRow` and `select` are declared inline at most call sites, so keying on
    // them would defeat the memo. The rows are the only real input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.rows]);

  /** Client paging: the endpoint returned everything, so narrow it here. */
  const matching = useMemo(() => {
    if (paging === "server") return mapped;
    const term = debouncedSearch.trim().toLowerCase();
    if (!term || !matches) return mapped;
    return mapped.filter((row) => matches(row, term));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapped, debouncedSearch, paging]);

  const rows = useMemo(() => {
    if (paging === "server") return matching;
    const start = pagination.pageIndex * pagination.pageSize;
    return matching.slice(start, start + pagination.pageSize);
  }, [matching, paging, pagination.pageIndex, pagination.pageSize]);

  const isClientPaged = paging === "client";

  return {
    rows,
    meta: query.meta,
    query: {
      isPending: query.isPending,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
    },
    table: {
      data: rows,
      search,
      onSearchChange: changeSearch,
      activeTab: filters.tab ?? "",
      onTabChange: (tab: string) => setFilter("tab", tab),
      pagination,
      onPaginationChange: setPagination,
      totalPages: isClientPaged
        ? Math.max(1, Math.ceil(matching.length / pagination.pageSize))
        : query.totalPages,
      totalCount: isClientPaged ? matching.length : query.totalCount,
      filterCounts,
      isLoading: query.isPending || query.isFetching,
    },
    filters,
    setFilter,
  };
}
