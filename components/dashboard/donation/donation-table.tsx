"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { DonationDetailsDialog } from "./donation-details";
import {
  type DonationRecord,
  type DonationType,
  type DonationStatus,
} from "@/types/donation";
import { cn } from "@/lib/utils";
import { DeliveryTimelineStep } from "@/types/donation";
import TabButton from "@/components/shared/tab-button";

function ActionsCell({
  row,
  onView,
}: {
  row: DonationRecord;
  onView: (row: DonationRecord) => void;
}) {
  return (
    <RowActions>
      <RowActions.Item icon={Eye} onSelect={() => onView(row)}>
        View Details
      </RowActions.Item>
    </RowActions>
  );
}

// ─── Status filter dropdown ───────────────────────────────────────────────────

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "In Transit",
  "Delivered",
  "Not Delivered",
] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-8 text-sm font-medium text-gray-700"
        >
          {value}
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 p-1">
        {STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt}
            className={cn(
              "text-sm cursor-pointer",
              value === opt && "font-medium text-[#2D7A4F]",
            )}
            onClick={() => onChange(opt)}
          >
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function buildMaterialColumns(
  onView: (row: DonationRecord) => void,
): ColumnDef<DonationRecord>[] {
  return [
    { accessorKey: "orderId", header: "Order ID" },
    { accessorKey: "item", header: "Item" },
    { accessorKey: "donor", header: "Donor" },
    { accessorKey: "recipient", header: "Recipient" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "deliveryMethod", header: "Delivery Method" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "date", header: "Date" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <ActionsCell row={row.original} onView={onView} />,
    },
  ];
}

// ─── Monetary columns ─────────────────────────────────────────────────────────

function buildMonetaryColumns(
  onView: (row: DonationRecord) => void,
): ColumnDef<DonationRecord>[] {
  return [
    { accessorKey: "orderId", header: "Order ID" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "donor", header: "Donor" },
    { accessorKey: "recipient", header: "Recipient" },
    { accessorKey: "type", header: "Type" },
    {
      accessorKey: "monetaryAmount",
      header: "Amount",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "date", header: "Date" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <ActionsCell row={row.original} onView={onView} />,
    },
  ];
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const STATUSES: DonationStatus[] = [
  "In Transit",
  "Pending",
  "In Transit",
  "Delivered",
  "Delivered",
  "Pending",
  "Not Delivered",
  "In Transit",
];

const samplePerson = {
  name: "Samuel Adebayo",
  email: "adebayo123@gmail.com",
  role: "Individual",
  userId: "USR-451",
  verified: true,
};

const sampleCharity = {
  ...samplePerson,
  role: "Charity/NGO",
};

const MATERIAL_DATA: DonationRecord[] = Array.from({ length: 16 }, (_, i) => ({
  orderId: "TRX123-012",
  createdAt: "Feb 7, 2025  2:35 PM",
  item: "Iphone 15 Pro Max",
  itemCategory: "Electronics",
  description: "Iphone 15 Pro Max",
  donor: "Tayo Igbira",
  recipient: i % 3 === 0 ? "N/A" : "Adejumo Adeyemi",
  type: "Material" as DonationType,
  deliveryMethod: (i % 2 === 0 ? "Pickup" : "Home Delivery") as
    | "Pickup"
    | "Home Delivery",
  status: STATUSES[i % STATUSES.length],
  date: "Feb 7, 2026",
  amount: "Free",
  deliveryStatus: STATUSES[i % STATUSES.length],
  deliveryCompany: "GIG Logistics",
  destination: "8, Oluwalogbo Street, Isolo",
  pickupAddress: "8, Oluwalogbo Street, Isolo",
  expectedDeliveryDate: "Feb 11, 2026",
  deliveryTimeline: [
    { label: "Request Accepted", status: "done" },
    { label: "Pending", status: "done" },
    { label: "In Transit", status: "active", subLabel: "In progress..." },
    { label: "Delivered", status: "pending" },
  ] as DeliveryTimelineStep[],
  donorDetails: samplePerson,
  recipientDetails: sampleCharity,
  buyerDetails: samplePerson,
  sellerDetails: sampleCharity,
}));

const MONETARY_DATA: DonationRecord[] = Array.from({ length: 16 }, (_, i) => ({
  orderId: "TRX123-012",
  createdAt: "Feb 7, 2025  2:36 PM",
  item: "Donation for you",
  itemCategory: "Monetary",
  description: "Donation for you",
  donor: "Tayo Igbira",
  recipient: i % 3 === 0 ? "N/A" : "Adejumo Adeyemi",
  type: "Monetary" as DonationType,
  status: "Paid" as DonationStatus,
  date: "Feb 7, 2026",
  monetaryAmount: "£20,000",
  paymentMethod: "Wallet",
  paidStatus: "Paid",
  donorDetails: samplePerson,
  recipientDetails: sampleCharity,
}));

type ActiveDonationTab = "material" | "monetary";

export function DonationsTable() {
  const [activeType, setActiveType] =
    React.useState<ActiveDonationTab>("material");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("All");
  const [selectedDonation, setSelectedDonation] =
    React.useState<DonationRecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  function handleView(row: DonationRecord) {
    setSelectedDonation(row);
    setDetailOpen(true);
  }

  const data = activeType === "material" ? MATERIAL_DATA : MONETARY_DATA;

  const filtered = React.useMemo(() => {
    if (statusFilter === "All") return data;
    return data.filter((r) => r.status === statusFilter);
  }, [data, statusFilter]);

  const materialColumns = React.useMemo(
    () => buildMaterialColumns(handleView),
    [],
  );
  const monetaryColumns = React.useMemo(
    () => buildMonetaryColumns(handleView),
    [],
  );

  const columns = activeType === "material" ? materialColumns : monetaryColumns;

  return (
    <div>
      <DataTable
        columns={columns}
        data={filtered}
        pageSize={7}
        rowLabel="donations"
        hideSortIcon={["actions"]}
        title="All Donations"
        headerExtra={
          <div className="flex items-center justify-between w-full mt-3 flex-wrap gap-2">
            {/* Type tabs */}
            <div className="flex gap-2 flex-wrap">
              <TabButton
                active={activeType === "material"}
                onClick={() => {
                  setActiveType("material");
                  setStatusFilter("All");
                }}
              >
                Material Donation (12)
              </TabButton>

              <TabButton
                active={activeType === "monetary"}
                onClick={() => {
                  setActiveType("monetary");
                  setStatusFilter("All");
                }}
              >
                Monetary Donation (13)
              </TabButton>
            </div>

            {/* Status filter — only for material tab */}
            {activeType === "material" && (
              <StatusFilterDropdown
                value={statusFilter}
                onChange={setStatusFilter}
              />
            )}
          </div>
        }
      />

      <DonationDetailsDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        donation={selectedDonation}
      />
    </div>
  );
}
