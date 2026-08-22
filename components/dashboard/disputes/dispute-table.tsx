"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { type OrderStatus } from "@/types/order-swap";
import { DataTable } from "@/components/shared/data-table";
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

const FILTER_COUNTS: Record<StatusFilter, number> = {
  "All Disputes": 300,
  Open: 20,
  "In Progress": 23,
  Resolved: 18,
  Closed: 5,
};

export default function DisputeTable() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<
    DateRangeFilterValue | undefined
  >(undefined);

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
        data={DISPUTES}
        headerExtra={
          <TableDateFilter selected={dateFilter} setSelected={setDateFilter} />
        }
        columns={columns}
        title="Recent Disputes"
        rowLabel="disputes"
        pageSize={7}
        filterTabs={STATUS_FILTERS}
        filterCounts={FILTER_COUNTS}
        filterColumnKey="status"
        allTabValue="All Disputes"
      />
    </>
  );
}
