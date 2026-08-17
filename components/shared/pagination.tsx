import { ChevronLeft, ChevronRight } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface BaseProps {
  rowLabel?: string;
  maxVisible?: number; // how many page buttons to show, default 5
  className?: string;
}

interface TableMode<T> extends BaseProps {
  table: Table<T>;
  /**
   * Total rows across every page, for a server-paginated table. Required
   * whenever the table is in `manualPagination` mode: the row model then holds
   * only the current page, so it cannot report the real total itself.
   */
  totalCount?: number;
  current?: never;
  total?: never;
  onChange?: never;
  /** Both come from the table's own state in this mode. */
  pageSize?: never;
  rowsOnPage?: never;
}

interface StandaloneMode extends BaseProps {
  table?: never;
  current: number;
  /** Number of pages. */
  total: number;
  onChange: (p: number) => void;
  /**
   * Total records across every page. Supply this together with `pageSize` to
   * get the same "Showing 1–10 of 247" summary a table renders; without it the
   * summary falls back to "Page 1 of 25".
   */
  totalCount?: number;
  pageSize?: number;
  /**
   * Records rendered on the current page. Defaults to a full page, so only a
   * list that can be short for reasons other than being last needs to pass it.
   */
  rowsOnPage?: number;
}

type PaginationProps<T> = TableMode<T> | StandaloneMode;

export function Pagination<T>({
  table,
  totalCount,
  pageSize,
  rowsOnPage,
  current,
  total,
  onChange,
  rowLabel = "rows",
  maxVisible = 5,
  className,
}: PaginationProps<T>) {
  // Normalise to a single interface regardless of mode
  const isTableMode = Boolean(table);

  const pageIndex = isTableMode
    ? table!.getState().pagination.pageIndex
    : current! - 1;
  // A manual table whose page count hasn't arrived yet reports -1, which would
  // otherwise reach getPageWindow as a negative length.
  const pageCount = Math.max(0, isTableMode ? table!.getPageCount() : total!);
  const canPrev = isTableMode ? table!.getCanPreviousPage() : current! > 1;
  const canNext = isTableMode ? table!.getCanNextPage() : current! < total!;

  const goTo = (zeroIndex: number) => {
    if (isTableMode) table!.setPageIndex(zeroIndex);
    else onChange!(zeroIndex + 1);
  };
  const goPrev = () => goTo(pageIndex - 1);
  const goNext = () => goTo(pageIndex + 1);

  // Windowed page numbers — always show `maxVisible` pages, centred on current
  const pages = getPageWindow(pageIndex + 1, pageCount, maxVisible);

  /**
   * "Showing 1–10 of 247 listings".
   *
   * A table reads all three inputs off its own state; a standalone list has to
   * pass `totalCount` and `pageSize`, and gets the plain page indicator when it
   * doesn't.
   */
  const rowSummary = (() => {
    // Server-paginated tables know their total only from `totalCount`; for a
    // client-paginated one the filtered row model already holds every row.
    const totalRows = isTableMode
      ? totalCount ?? table!.getFilteredRowModel().rows.length
      : totalCount;
    const size = isTableMode ? table!.getState().pagination.pageSize : pageSize;

    if (totalRows === undefined || !size) return null;

    // Counting the rows actually rendered gets the last, partial page right
    // without special-casing it.
    const onPage = isTableMode
      ? table!.getRowModel().rows.length
      : rowsOnPage ?? Math.min(size, Math.max(0, totalRows - pageIndex * size));

    if (totalRows === 0 || onPage === 0) return { start: 0, end: 0, totalRows };

    const start = pageIndex * size + 1;
    return { start, end: Math.min(start + onPage - 1, totalRows), totalRows };
  })();

  // Nothing to page through — an empty table already says "No results", and a
  // "Showing 0–0 of 0" row with dead arrows underneath it only adds noise.
  const isEmpty = rowSummary ? rowSummary.totalRows === 0 : pageCount === 0;
  if (isEmpty) return null;

  return (
    <div
      className={cn(
        " py-3.5 flex items-center justify-between",
        className,
      )}
    >
      {/* Left: row count (table mode) or page indicator (standalone) */}
      {rowSummary ? (
        <p className="text-xs text-gray-400">
          Showing {rowSummary.start}–{rowSummary.end} of {rowSummary.totalRows}{" "}
          {rowLabel}
        </p>
      ) : (
        <p className="text-xs text-gray-400">
          Page {pageIndex + 1} of {pageCount}
        </p>
      )}

      <div className="flex items-center gap-1">
        {/* Prev */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={!canPrev}
          className="w-7 h-7 rounded disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page buttons with ellipsis */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-7 h-7 flex items-center justify-center text-xs text-gray-400"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              onClick={() => goTo((p as number) - 1)}
              className={cn(
                "w-7 h-7 rounded text-xs font-medium transition-colors",
                pageIndex === (p as number) - 1
                  ? "bg-white text-black border border-[#1B1C1E]"
                  : " text-white hover:bg-muted",
              )}
            >
              {p}
            </Button>
          ),
        )}

        {/* Next */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          disabled={!canNext}
          className="w-7 h-7 rounded disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Returns an array like [1, "...", 4, 5, 6, "...", 20]
function getPageWindow(
  current: number,
  total: number,
  max: number,
): (number | "...")[] {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);

  const half = Math.floor(max / 2);
  let start = Math.max(2, current - half);
  let end = Math.min(total - 1, current + half);

  if (current - 1 <= half) {
    start = 2;
    end = max - 1;
  }
  if (total - current <= half) {
    start = total - max + 2;
    end = total - 1;
  }

  const pages: (number | "...")[] = [1];
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}
