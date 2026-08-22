import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFixturePanel } from "@/hooks/shared/use-fixture-panel";

interface Row {
  id: string;
  status: "Pending" | "Approved" | "Rejected";
}

const ROWS: Row[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  status: (["Pending", "Approved", "Rejected"] as const)[i % 3],
}));

const ALL = "All";

function renderPanel() {
  return renderHook(() =>
    useFixturePanel({
      rows: ROWS,
      pageSize: 5,
      initialFilters: { tab: ALL },
      matches: (row, _term, { tab }) => tab === ALL || row.status === tab,
    }),
  );
}

describe("useFixturePanel", () => {
  it("presents rows already in hand as a settled query", () => {
    const { result } = renderPanel();

    // Every branch but the content one has to be false, or a table fed from
    // fixtures would sit on a skeleton forever.
    expect(result.current.query.isPending).toBe(false);
    expect(result.current.query.isError).toBe(false);
    expect(result.current.table.isLoading).toBe(false);
  });

  it("pages the fixture in memory", () => {
    const { result } = renderPanel();

    expect(result.current.table.data).toHaveLength(5);
    expect(result.current.table.totalCount).toBe(12);
    expect(result.current.table.totalPages).toBe(3);

    act(() =>
      result.current.table.onPaginationChange({ pageIndex: 2, pageSize: 5 }),
    );

    expect(result.current.table.data).toHaveLength(2);
  });

  it("narrows by tab and re-counts", () => {
    const { result } = renderPanel();

    act(() => result.current.table.onTabChange("Pending"));

    expect(result.current.table.totalCount).toBe(4);
    expect(
      result.current.table.data.every((row) => row.status === "Pending"),
    ).toBe(true);
  });

  it("returns to the first page when the tab changes", () => {
    const { result } = renderPanel();

    act(() =>
      result.current.table.onPaginationChange({ pageIndex: 2, pageSize: 5 }),
    );
    act(() => result.current.table.onTabChange("Approved"));

    expect(result.current.table.pagination.pageIndex).toBe(0);
  });
});
