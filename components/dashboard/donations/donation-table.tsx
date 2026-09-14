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
import TableDateFilter from "@/components/shared/date/table-date-filter";
import { downloadTableCsv } from "@/lib/export";
import { CHARITY_PARTNERS } from "@/data/charity-partners";
import type { DateRangeFilterValue } from "@/types/date";

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

// ─── Header filters ──────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "In Transit",
  "Delivered",
  "Not Delivered",
] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

/** The sentinel the charity filter falls back to, and its own menu entry. */
const ALL_CHARITIES = "All Charity Partners";

/**
 * A dropdown that reads as one of the header's tabs — the status filter and the
 * charity-partner filter are the same control over different option lists, so
 * they share one component rather than two near-identical menus.
 */
function FilterDropdown<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  /** Announced to screen readers, which otherwise hear only the current value. */
  label: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={label}
          className="flex h-9 items-center gap-2 rounded-full text-sm font-normal"
        >
          {value}
          <ChevronDown
            className="w-3.5 h-3.5 text-gray-400 transition-transform group-data-[state=open]/button:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52 p-1">
        {options.map((opt) => (
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
  role: "Charity Partner",
};

const MATERIAL_DATA: DonationRecord[] = Array.from({ length: 16 }, (_, i) => ({
  orderId: "TRX123-012",
  createdAt: "Feb 7, 2025  2:35 PM",
  item: "Iphone 15 Pro Max",
  itemCategory: "Electronics",
  description: "Iphone 15 Pro Max",
  donor: "Tayo Igbira",
  // Every fourth donation has no recipient yet; the rest cycle through the
  // charity partners the header filter offers.
  recipient:
    i % 4 === 0 ? "N/A" : CHARITY_PARTNERS[i % CHARITY_PARTNERS.length],
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
  recipient:
    i % 4 === 0 ? "N/A" : CHARITY_PARTNERS[i % CHARITY_PARTNERS.length],
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
  const [charityFilter, setCharityFilter] = React.useState<string>(ALL_CHARITIES);
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState<
    DateRangeFilterValue | undefined
  >();
  const [selectedDonation, setSelectedDonation] =
    React.useState<DonationRecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  function handleView(row: DonationRecord) {
    setSelectedDonation(row);
    setDetailOpen(true);
  }

  function switchType(next: ActiveDonationTab) {
    setActiveType(next);
    setStatusFilter("All");
    setCharityFilter(ALL_CHARITIES);
  }

  const data = activeType === "material" ? MATERIAL_DATA : MONETARY_DATA;

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return data.filter((row) => {
      if (statusFilter !== "All" && row.status !== statusFilter) return false;
      if (charityFilter !== ALL_CHARITIES && row.recipient !== charityFilter) {
        return false;
      }
      if (!term) return true;

      return [row.orderId, row.item, row.description, row.donor, row.recipient]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });
  }, [data, statusFilter, charityFilter, search]);

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
          <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-3">
            {/* Tabs and the two filters that scope them read as one row: the
                dropdowns sit alongside the tabs rather than across the header,
                because each one narrows what the selected tab is showing. */}
            <div className="flex flex-wrap items-center gap-2">
              <TabButton
                active={activeType === "material"}
                onClick={() => switchType("material")}
              >
                Material Donation (12)
              </TabButton>

              <TabButton
                active={activeType === "monetary"}
                onClick={() => switchType("monetary")}
              >
                Monetary Donation (13)
              </TabButton>

              {/* Monetary donations are all Paid, so there is nothing for a
                  delivery status to filter there. */}
              {activeType === "material" && (
                <FilterDropdown
                  label="Filter by status"
                  value={statusFilter}
                  options={STATUS_OPTIONS}
                  onChange={setStatusFilter}
                />
              )}

              <FilterDropdown
                label="Filter by charity partner"
                value={charityFilter}
                options={[ALL_CHARITIES, ...CHARITY_PARTNERS]}
                onChange={setCharityFilter}
              />
            </div>

            <TableDateFilter
              selected={dateFilter}
              setSelected={setDateFilter}
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search donations"
              onExport={() =>
                downloadTableCsv(
                  columns,
                  filtered,
                  `donations-${activeType}.csv`,
                )
              }
            />
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
