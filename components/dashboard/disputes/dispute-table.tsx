"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { type OrderStatus } from "@/types/order-swap";
import { DataTable } from "@/components/shared/data-table";
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
        cell: ({ row }) => {
          const dispute = row.original;
          const isOpen = openMenuId === dispute.id;
          return (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(isOpen ? null : dispute.id);
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
                      router.push(`/disputes/${dispute.id}`);
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
    [openMenuId, router],
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
