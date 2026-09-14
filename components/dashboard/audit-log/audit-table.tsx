"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { TableSearchInput } from "@/components/shared/table-search-input";
import { DateRangeFilter } from "@/components/shared/date/date-range-filter";
import { formatDateTime } from "@/lib/adapters/shared";
import { endOfDay } from "@/lib/date";
import type { DateRangeFilterValue } from "@/types/date";
import { useFixturePanel } from "@/hooks/shared/use-fixture-panel";
import { AUDIT_EVENTS } from "@/data/audit-events";
import type { AuditArea, AuditEvent } from "@/types/audit-event";

const ALL_TAB = "All Activity";

const AREA_FILTERS = [
  ALL_TAB,
  "Users",
  "Listings",
  "Wallet",
  "Verification",
  "Disputes",
  "Settings",
] as const satisfies readonly (AuditArea | typeof ALL_TAB)[];

/** Counted from the rows, so a tab can never disagree with what it opens onto. */
const FILTER_COUNTS = AREA_FILTERS.reduce<Record<string, number>>(
  (counts, tab) => ({
    ...counts,
    [tab]:
      tab === ALL_TAB
        ? AUDIT_EVENTS.length
        : AUDIT_EVENTS.filter((row) => row.area === tab).length,
  }),
  {},
);

/**
 * The admin activity trail.
 *
 * Fixture-fed: the Admin API documents no audit resource, so the rows are a
 * module constant behind `useFixturePanel` rather than passed to the table
 * directly — the tab, the search and the page position work here exactly as
 * they will once an endpoint exists, and wiring it swaps the adapter alone.
 *
 * Read-only by design. An audit trail an admin can act on from the table is
 * not an audit trail, so there is no kebab column and no row dialog.
 */
export function AuditTable() {
  /**
   * The picker deals in `Date`s and the panel's filters in strings, so the
   * chosen range is kept here for the trigger's label and handed to the panel
   * as two timestamps — the same split the listings page makes.
   */
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>();

  const panel = useFixturePanel<AuditEvent>({
    rows: AUDIT_EVENTS,
    pageSize: 7,
    initialFilters: { tab: ALL_TAB },
    matches: (row, term, { tab, fromDate, toDate }) => {
      if (tab !== ALL_TAB && row.area !== tab) return false;

      const performedAt = new Date(row.performedAt).getTime();
      if (fromDate && performedAt < new Date(fromDate).getTime()) return false;
      if (toDate && performedAt > new Date(toDate).getTime()) return false;

      if (!term) return true;

      // Everything an admin would have in hand when they come looking: who did
      // it, what they did, and the reference of the record it was done to.
      return [row.actor.name, row.actor.email, row.action, row.target].some(
        (field) => field.toLowerCase().includes(term),
      );
    },
  });

  const columns = useMemo<ColumnDef<AuditEvent>[]>(
    () => [
      {
        accessorKey: "actor",
        header: "Admin",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {row.original.actor.name}
            </p>
            <p className="text-xs text-[#868686]">{row.original.actor.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "area",
        header: "Area",
        cell: ({ getValue }) => (
          <span className="text-sm text-[#4F4F4F]">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "target",
        header: "Record",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-[#4F4F4F]">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: ({ getValue }) => (
          <span className="text-sm text-[#868686]">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "performedAt",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium whitespace-nowrap">
            {formatDateTime(getValue<string>())}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={panel.table.data}
      title="Recent Activity"
      rowLabel="events"
      pageSize={panel.table.pagination.pageSize}
      manualPagination
      pagination={panel.table.pagination}
      onPaginationChange={panel.table.onPaginationChange}
      totalPages={panel.table.totalPages}
      totalCount={panel.table.totalCount}
      activeTab={panel.table.activeTab}
      onTabChange={panel.table.onTabChange}
      filterTabs={AREA_FILTERS}
      filterCounts={FILTER_COUNTS}
      allTabValue={ALL_TAB}
      headerExtra={
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <DateRangeFilter
            value={dateFilter}
            onChange={(next) => {
              setDateFilter(next);
              // Closed at the end of the chosen day, so a single-day range
              // covers the whole of it rather than only its first instant.
              panel.setFilter("fromDate", next.range.from.toISOString());
              panel.setFilter("toDate", endOfDay(next.range.to).toISOString());
            }}
          />

          <TableSearchInput
            placeholder="Search admin, action or record"
            value={panel.table.search}
            onChange={panel.table.onSearchChange}
            className="mt-0 w-full md:mt-0 md:w-60"
          />
        </div>
      }
    />
  );
}
