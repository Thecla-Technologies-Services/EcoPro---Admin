"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { type OrderStatus } from "@/types/order";
import { DataTable } from "@/components/shared/data-table";
import { useFixturePanel } from "@/hooks/shared/use-fixture-panel";
import { RowActions } from "@/components/shared/row-actions";
import TableDateFilter from "../../shared/date/table-date-filter";
import { downloadTableCsv } from "@/lib/export";
import { CountrySelect } from "@/components/shared/country-select";
import { toCountryLabel } from "@/constants/country";
import { DateRangeFilterValue } from "@/types/date";
import type { Dispute } from "@/types/dispute";
import { DISPUTES } from "@/data/disputes";
import { Amount } from "@/components/shared/amount";

const STATUS_FILTERS = [
  "All Disputes",
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const ALL_TAB: StatusFilter = "All Disputes";

/**
 * Counted from the rows rather than written down — the literals here disagreed
 * with what the table actually held.
 */
const FILTER_COUNTS = STATUS_FILTERS.reduce<Record<string, number>>(
  (counts, tab) => ({
    ...counts,
    [tab]:
      tab === ALL_TAB
        ? DISPUTES.length
        : DISPUTES.filter((row) => row.status === tab).length,
  }),
  {},
);

export default function DisputeTable() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<
    DateRangeFilterValue | undefined
  >(undefined);

  const panel = useFixturePanel({
    rows: DISPUTES,
    pageSize: 7,
    initialFilters: { tab: ALL_TAB },
    matches: (row, term, { tab }) => {
      if (tab !== ALL_TAB && row.status !== tab) return false;
      if (!term) return true;

      // Searched in memory, like the rows themselves: no endpoint serves a
      // dispute, so there is nothing to hand a search term to.
      return [row.transactionId, row.title, row.reason, row.buyer?.name, row.seller?.name]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term.toLowerCase()));
    },
  });

  const columns = useMemo<ColumnDef<Dispute>[]>(
    () => [
      {
        accessorKey: "transactionId",
        header: "Dispute ID",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-[#4F4F4F]">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Item",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "buyer",
        header: "Buyer",
        cell: ({ row }) => (
          <span className="text-sm text-foreground font-medium">
            {row.original.buyer.name}
          </span>
        ),
      },
      {
        accessorKey: "seller",
        header: "Seller",
        cell: ({ row }) => (
          <span className="text-sm text-foreground font-medium">
            {row.original.seller.name}
          </span>
        ),
      },
      {
        accessorKey: "raisedBy",
        header: "Dispute Raised By",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            <Amount amount={getValue<number>()} />
          </span>
        ),
      },
      {
        // Fixture-fed, like every column here — see `DISPUTES`. Nothing in the
        // Admin API reports a dispute's country yet.
        accessorKey: "country",
        header: "Country",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium whitespace-nowrap">
            {toCountryLabel(getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue<OrderStatus>()} />
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RowActions>
            <RowActions.Item
              icon={Eye}
              onSelect={() => router.push(`/disputes/${row.original.id}`)}
            >
              View Details
            </RowActions.Item>
          </RowActions>
        ),
      },
    ],
    [router],
  );

  return (
    <>
      <DataTable
        data={panel.table.data}
        manualPagination
        pagination={panel.table.pagination}
        onPaginationChange={panel.table.onPaginationChange}
        totalPages={panel.table.totalPages}
        totalCount={panel.table.totalCount}
        activeTab={panel.table.activeTab}
        onTabChange={panel.table.onTabChange}
        headerExtra={
          <TableDateFilter
            selected={dateFilter}
            setSelected={setDateFilter}
            search={panel.table.search}
            onSearchChange={panel.table.onSearchChange}
            searchPlaceholder="Search disputes"
            onExport={() =>
              downloadTableCsv(columns, panel.table.data, "disputes.csv")
            }
          />
        }
        // Opposite the heading rather than among the filters: it scopes the
        // whole table, and it is the one control here that does not narrow the
        // rows within it.
        titleExtra={<CountrySelect className="rounded-full" />}
        columns={columns}
        title="Recent Disputes"
        rowLabel="disputes"
        pageSize={7}
        filterTabs={STATUS_FILTERS}
        filterCounts={FILTER_COUNTS}
        allTabValue={ALL_TAB}
      />
    </>
  );
}
