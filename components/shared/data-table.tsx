"use client";

import React, { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/shared/pagination";
import TabButton from "./tab-button";

interface DataTableProps<TData, TValue> {
  /** Column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Row data */
  data: TData[];
  /** Default page size (default: 7) */
  pageSize?: number;
  /** Label used in pagination row count e.g. "orders" */
  rowLabel?: string;
  /** Hide the sort chevron on specific column ids */
  hideSortIcon?: string[];
  /** Additional class on the root wrapper */
  className?: string;

  // ── Optional filter tabs ────────────────────────────────────────────────
  /** Tab labels; first item is treated as "show all" */
  filterTabs?: readonly string[];
  /** Map of tab label → display count shown in parentheses */
  filterCounts?: Record<string, number>;
  /** Column accessor key to filter on when a tab is selected */
  filterColumnKey?: string;
  /** Value that means "show everything" — defaults to filterTabs[0] */
  allTabValue?: string;
  /**
   * Controlled active tab. Pass this together with `onTabChange` when the
   * server does the filtering; omit both to keep the built-in client-side
   * filtering driven by `filterColumnKey`.
   */
  activeTab?: string;
  onTabChange?: (tab: string) => void;

  // ── Optional header ─────────────────────────────────────────────────────
  title?: string;

  manualPagination?: boolean;
  pagination?: PaginationState;
  totalPages?: number;
  totalCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;

  onRowSelectionChange?: (selectedRows: TData[]) => void;
  headerExtra?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 7,
  rowLabel = "rows",
  hideSortIcon = ["actions"],
  className,
  filterTabs,
  filterCounts,
  filterColumnKey,
  allTabValue,
  activeTab: externalActiveTab,
  onTabChange,
  title,
  manualPagination = false,
  pagination: externalPagination,
  totalPages,
  totalCount,
  onPaginationChange,
  onRowSelectionChange,
  headerExtra,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    allTabValue ?? filterTabs?.[0] ?? "",
  );
  const activeTab = externalActiveTab ?? internalActiveTab;
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    { pageIndex: 0, pageSize },
  );

  const currentPagination = externalPagination ?? internalPagination;

  // Reset to page 0 whenever the active tab changes
  const handleTabChange = (tab: string) => {
    if (onTabChange) onTabChange(tab);
    else setInternalActiveTab(tab);
    if (manualPagination && onPaginationChange) {
      onPaginationChange({ ...currentPagination, pageIndex: 0 });
    } else {
      setInternalPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  };

  const filteredData = React.useMemo(() => {
    const allValue = allTabValue ?? filterTabs?.[0];
    if (!filterTabs || !filterColumnKey || activeTab === allValue) return data;

    return data.filter(
      (row) => (row as Record<string, unknown>)[filterColumnKey] === activeTab,
    );
  }, [data, filterTabs, filterColumnKey, activeTab, allTabValue]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnFilters,
      rowSelection,
      pagination: currentPagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    pageCount: manualPagination ? totalPages : undefined,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(currentPagination) : updater;
      if (manualPagination && onPaginationChange) {
        onPaginationChange(next);
      } else {
        setInternalPagination(next);
      }
    },
    initialState: { pagination: { pageSize } },
  });

  // Notify parent of row selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, onRowSelectionChange, table]);

  const allValue = allTabValue ?? filterTabs?.[0];

  return (
    <div className={cn("bg-white overflow-x-hidden", className)}>
      {/* ── Header ── */}
      {(title || filterTabs || headerExtra) && (
        <div className="py-4 border-b border-gray-100">
          {title && (
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              {title}
            </h2>
          )}

          {/* Tabs left, extras right — but with nothing on the left to balance
              against (no title, no tabs) a lone control belongs on the right
              rather than floating under the table's first column. */}
          <div
            className={cn(
              "flex items-center gap-2 flex-wrap",
              title || (filterTabs && headerExtra)
                ? "justify-between"
                : "justify-end",
              title && "mb-4",
            )}
          >
            {filterTabs && (
              <div className="flex gap-2 flex-wrap">
                {filterTabs.map((tab) => (
                  <TabButton
                    key={tab}
                    active={activeTab === tab}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab}
                    {tab !== allValue && filterCounts?.[tab]
                      ? ` (${filterCounts[tab]})`
                      : ""}
                  </TabButton>
                ))}
              </div>
            )}

            {headerExtra}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  className="border-b border-gray-100 bg-gray-50/50"
                >
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {!hideSortIcon.includes(header.column.id) && (
                            <ChevronDown className="w-3 h-3 text-gray-300" />
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#E0E0E0] hover:bg-gray-50/70 transition-colors cursor-default"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 text-sm font-medium py-3.5 md:py-6 whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-sm text-gray-400"
                  >
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination table={table} totalCount={totalCount} rowLabel={rowLabel} />
    </div>
  );
}
