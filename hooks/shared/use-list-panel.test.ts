import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useListPanel,
  type ListQueryParams,
  type ListQueryResult,
} from "@/hooks/shared/use-list-panel";

interface Dto {
  id: string;
  name: string;
}

/**
 * Stands in for an endpoint. Records the params it was called with, so a test
 * can assert on what the panel would have asked the API for — which is where
 * the paging conversion and the debounce are observable.
 */
function stubQuery(rows: Dto[] = [], totals?: { pages: number; count: number }) {
  const calls: ListQueryParams[] = [];

  const useQuery = (params: ListQueryParams): ListQueryResult<Dto> => {
    calls.push(params);
    return {
      rows,
      totalPages: totals?.pages,
      totalCount: totals?.count,
      isPending: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: () => {},
    };
  };

  return { useQuery, calls, last: () => calls[calls.length - 1] };
}

const toRow = (dto: Dto) => dto;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

/** `useDebouncedValue` waits 350ms; push past it and flush the state update. */
function settleDebounce() {
  act(() => void vi.advanceTimersByTime(400));
}

describe("useListPanel", () => {
  describe("returns to the first page whenever the result set changes", () => {
    it("on a filter change", () => {
      const { useQuery } = stubQuery();
      const { result } = renderHook(() => useListPanel({ useQuery, toRow }));

      act(() => result.current.table.onPaginationChange({ pageIndex: 3, pageSize: 10 }));
      expect(result.current.table.pagination.pageIndex).toBe(3);

      act(() => result.current.setFilter("country", "Nigeria"));

      expect(result.current.table.pagination.pageIndex).toBe(0);
      expect(result.current.filters.country).toBe("Nigeria");
    });

    it("on a tab change", () => {
      const { useQuery } = stubQuery();
      const { result } = renderHook(() => useListPanel({ useQuery, toRow }));

      act(() => result.current.table.onPaginationChange({ pageIndex: 2, pageSize: 10 }));
      act(() => result.current.table.onTabChange("Flagged"));

      expect(result.current.table.pagination.pageIndex).toBe(0);
      expect(result.current.table.activeTab).toBe("Flagged");
    });

    it("on a search change", () => {
      const { useQuery } = stubQuery();
      const { result } = renderHook(() => useListPanel({ useQuery, toRow }));

      act(() => result.current.table.onPaginationChange({ pageIndex: 4, pageSize: 10 }));
      act(() => result.current.table.onSearchChange("shoes"));

      expect(result.current.table.pagination.pageIndex).toBe(0);
    });

    it("keeps the page when only the page changes", () => {
      const { useQuery } = stubQuery();
      const { result } = renderHook(() => useListPanel({ useQuery, toRow }));

      act(() => result.current.table.onPaginationChange({ pageIndex: 2, pageSize: 10 }));

      expect(result.current.table.pagination.pageIndex).toBe(2);
    });
  });

  describe("search", () => {
    it("is reported to the caller immediately", () => {
      const { useQuery } = stubQuery();
      const { result } = renderHook(() => useListPanel({ useQuery, toRow }));

      act(() => result.current.table.onSearchChange("sam"));

      // The input must not lag behind the keystroke, even though the query does.
      expect(result.current.table.search).toBe("sam");
    });

    it("does not reach the query until the debounce elapses", () => {
      const stub = stubQuery();
      const { result } = renderHook(() => useListPanel({ useQuery: stub.useQuery, toRow }));

      act(() => result.current.table.onSearchChange("sam"));
      expect(stub.last().search).toBe("");

      settleDebounce();
      expect(stub.last().search).toBe("sam");
    });
  });

  it("hands the query its filters and page position", () => {
    const stub = stubQuery();
    const { result } = renderHook(() =>
      useListPanel({ useQuery: stub.useQuery, toRow, initialFilters: { tab: "all" } }),
    );

    expect(stub.last().filters).toEqual({ tab: "all" });
    expect(stub.last().pagination).toEqual({ pageIndex: 0, pageSize: 10 });

    act(() => result.current.setFilter("listingType", "Sell"));

    expect(stub.last().filters).toEqual({ tab: "all", listingType: "Sell" });
  });

  describe("server paging", () => {
    const rows: Dto[] = [
      { id: "1", name: "one" },
      { id: "2", name: "two" },
    ];

    it("takes its totals from the query and does not slice the rows", () => {
      const { useQuery } = stubQuery(rows, { pages: 9, count: 86 });
      const { result } = renderHook(() =>
        useListPanel({ useQuery, toRow, pageSize: 1 }),
      );

      expect(result.current.rows).toHaveLength(2);
      expect(result.current.table.totalPages).toBe(9);
      expect(result.current.table.totalCount).toBe(86);
    });

    it("applies `select` to the mapped rows", () => {
      const { useQuery } = stubQuery(rows);
      const { result } = renderHook(() =>
        useListPanel({
          useQuery,
          toRow,
          select: (all) => all.filter((row) => row.name !== "one"),
        }),
      );

      expect(result.current.rows).toEqual([{ id: "2", name: "two" }]);
    });
  });

  describe("client paging", () => {
    const rows: Dto[] = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `row ${i}`,
    }));

    it("slices the page itself and computes its own totals", () => {
      const { useQuery } = stubQuery(rows);
      const { result } = renderHook(() =>
        useListPanel({ useQuery, toRow, paging: "client", pageSize: 10 }),
      );

      expect(result.current.rows).toHaveLength(10);
      expect(result.current.rows[0].id).toBe("0");
      expect(result.current.table.totalPages).toBe(3);
      expect(result.current.table.totalCount).toBe(25);

      act(() => result.current.table.onPaginationChange({ pageIndex: 2, pageSize: 10 }));

      expect(result.current.rows).toHaveLength(5);
      expect(result.current.rows[0].id).toBe("20");
    });

    it("filters by the search term and re-counts", () => {
      const { useQuery } = stubQuery(rows);
      const { result } = renderHook(() =>
        useListPanel({
          useQuery,
          toRow,
          paging: "client",
          pageSize: 10,
          matches: (row, term) => row.name.includes(term),
        }),
      );

      act(() => result.current.table.onSearchChange("row 1"));
      settleDebounce();

      // "row 1", "row 10".."row 19" — eleven of the twenty-five.
      expect(result.current.table.totalCount).toBe(11);
      expect(result.current.table.totalPages).toBe(2);
      expect(result.current.rows).toHaveLength(10);
    });
  });
});
