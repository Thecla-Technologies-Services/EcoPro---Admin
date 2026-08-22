"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { type Order, type OrderStatus } from "@/types/order-swap";
import { ORDERS } from "@/data/swap";
import OrderDetailDialog from "./order-detail-dialog";
import { DataTable } from "@/components/shared/data-table"; // ← reusable component
import TableDateFilter from "../../shared/table-date-filter";
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
        cell: ({ row }) => {
          const order = row.original;
          const isOpen = openMenuId === order.id;
          return (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(isOpen ? null : order.id);
                }}
                className="p-1.5 cursor-pointer rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {isOpen && (
                <div
                  className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-32.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSelectedOrder(order);
                      setDialogOpen(true);
                      setOpenMenuId(null);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [openMenuId],
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
