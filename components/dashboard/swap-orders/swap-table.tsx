"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { type Order, type OrderStatus } from "@/types/order";
import { DataState } from "@/components/shared/data-state";
import { useSwapOrdersPanel } from "@/hooks/admin/use-swap-orders";
import OrderDetailDialog from "./order-detail-dialog";
import {
  DataTable } from "@/components/shared/data-table"; // ← reusable component
import { RowActions,
} from "@/components/shared/row-actions";
import TableDateFilter from "../../shared/date/table-date-filter";
import { DateRangeFilterValue } from "@/types/date";
import { Amount } from "@/components/shared/amount";

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  "All Orders",
  "Delivered",
  "In Transit",
  "Pending Pickup",
  "Disputed",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

/**
 * The tabs are kept for the design's sake but filter nothing: the list behind
 * them is `GET /swaps/disputed`, which takes no status parameter and returns
 * only disputed rows — so every tab shows the same list, and no counts are
 * claimed. They start meaning something when an all-swaps endpoint exists.
 */

export default function SwapTable() {
  const panel = useSwapOrdersPanel({ pageSize: 7 });
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
            <Amount amount={getValue<number>()} />
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
      <DataState>
        <DataState.Error
          when={panel.query.isError}
          error={panel.query.error}
          onRetry={panel.query.refetch}
        />
        <DataState.Content>
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
              />
            }
            columns={columns}
            title="Recent Orders"
            rowLabel="orders"
            pageSize={7}
            filterTabs={STATUS_FILTERS}
            allTabValue="All Orders"
          />
        </DataState.Content>
      </DataState>

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
