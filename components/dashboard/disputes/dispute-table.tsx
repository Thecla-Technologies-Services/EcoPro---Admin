"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { type OrderStatus } from "@/types/order-swap";
import { DataTable } from "@/components/shared/data-table";
import { useFixturePanel } from "@/hooks/shared/use-fixture-panel";
import { RowActions } from "@/components/shared/row-actions";
import TableDateFilter from "../../shared/table-date-filter";
import { DateRangeFilterValue } from "@/types/date";
import type { Dispute } from "@/types/dispute";
import { DISPUTES } from "@/data/disputes";

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
    matches: (row, _term, { tab }) => tab === ALL_TAB || row.status === tab,
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
            ₦{getValue<number>().toLocaleString()}.00
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
          <TableDateFilter selected={dateFilter} setSelected={setDateFilter} />
        }
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
