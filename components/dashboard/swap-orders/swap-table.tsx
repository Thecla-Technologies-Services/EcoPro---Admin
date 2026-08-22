"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { type Order, type OrderStatus } from "@/types/order-swap";
import { ORDERS } from "@/data/swap";
import OrderDetailDialog from "./order-detail-dialog";
import {
  DataTable } from "@/components/shared/data-table"; // ← reusable component
import { RowActions,
} from "@/components/shared/row-actions";
import TableDateFilter from "../../shared/date/table-date-filter";
import { DateRangeFilterValue } from "@/types/date";

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  "All Orders",
  "Delivered",
  "In Transit",
  "Pending Pickup",
  "Disputed",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const FILTER_COUNTS: Record<StatusFilter, number> = {
  "All Orders": 300,
  Delivered: 20,
  "In Transit": 23,
  "Pending Pickup": 18,
  Disputed: 5,
};

export default function SwapTable() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dateFilter, setDateFilter] = useState<
    DateRangeFilterValue | undefined
  >(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-[#4F4F4F]">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "item",
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
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "seller",
        header: "Seller",
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
        accessorKey: "deliveryMethod",
        header: "Delivery Method",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            {getValue<string>()}
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
              onSelect={() => {
                setSelectedOrder(row.original);
                setDialogOpen(true);
              }}
            >
              View Details
            </RowActions.Item>
          </RowActions>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        data={ORDERS}
        headerExtra={
          <TableDateFilter selected={dateFilter} setSelected={setDateFilter} />
        }
        columns={columns}
        title="Recent Orders"
        rowLabel="orders"
        pageSize={7}
        filterTabs={STATUS_FILTERS}
        filterCounts={FILTER_COUNTS}
        filterColumnKey="status"
        allTabValue="All Orders"
      />

      <OrderDetailDialog
        order={selectedOrder}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedOrder(null);
        }}
      />
    </>
  );
}
