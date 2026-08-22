"use client";

import {
  useListPanel,
  type ListFilters,
  type ListPanelState,
} from "@/hooks/shared/use-list-panel";

/**
 * A list panel fed by rows already in hand rather than by an endpoint.
 *
 * Several modules render from module constants because their endpoints are not
 * wired yet. Left as constants passed straight to a table, going live means
 * rewriting each table: today they have no loading, error or empty branch at
 * all, because a constant never has one. Behind this they satisfy the same
 * `ListPanelState` a live list does, so wiring the API later swaps the adapter
 * and leaves the view alone.
 *
 * It is also the second adapter at this seam. `useListPanel` already pages on
 * the server for `/api/admin/users` and in memory for `/api/user/get-all`; this
 * reuses the in-memory path rather than adding one.
 *
 * ```tsx
 * const panel = useFixturePanel({
 *   rows: WITHDRAWAL_REQUESTS,
 *   initialFilters: { tab: "All" },
 *   matches: (row, _term, { tab }) => tab === "All" || row.status === tab,
 * });
 * ```
 */
export function useFixturePanel<Row>({
  rows,
  pageSize,
  initialFilters,
  matches,
  filterCounts,
}: {
  /** Must be stable across renders — a module constant, not an inline array. */
  rows: Row[];
  pageSize?: number;
  initialFilters?: ListFilters;
  matches?: (row: Row, term: string, filters: ListFilters) => boolean;
  filterCounts?: Record<string, number>;
}): ListPanelState<Row> {
  return useListPanel<Row, Row>({
    paging: "client",
    pageSize,
    initialFilters,
    matches,
    filterCounts,
    toRow: (row) => row,
    useQuery: () => ({
      rows,
      // Nothing is in flight, so every branch but the content one is false.
      isPending: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: () => {},
    }),
  });
}
