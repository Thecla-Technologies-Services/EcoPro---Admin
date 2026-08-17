"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { type OrderStatus } from "@/types/order-swap";
import DetailPanel from "./detail-panel";
import { DataTable } from "@/components/shared/data-table";
import TableDateFilter from "../../shared/table-date-filter";
import { ApproveDialog } from "./approve-dialog";
import { RejectDialog } from "./reject-dialog";
import { DateRangeFilterValue } from "@/types/date";
import { type Applicant } from "@/types/verification";
import { MOCK_APPLICANTS } from "@/data/verification";

const STATUS_FILTERS = [
  "All Disputes",
  "Pending Review",
  "Approved",
  "Rejected",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const FILTER_COUNTS: Record<StatusFilter, number> = {
  "All Disputes": 300,
  "Pending Review": 20,
  Approved: 23,
  Rejected: 18,
};

export default function VerificationTable() {
  const [selectedDispute, setSelectedDispute] = useState<Applicant | null>(
    null,
  );
  const [dateFilter, setDateFilter] = useState<
    DateRangeFilterValue | undefined
  >(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const columns = useMemo<ColumnDef<Applicant>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Reference ID",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-[#4F4F4F]">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Applicant",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "accountType",
        header: "Type",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "date",
        header: "Submission Date",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "reviewer",
        header: "Reviewed By",
        cell: ({ getValue }) => (
          <span className="text-sm text-foreground font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "reviewDate",
        header: "Review Date",
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
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {isOpen && (
                <div
                  className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-32.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSelectedDispute(order);
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
        data={MOCK_APPLICANTS}
        headerExtra={
          <TableDateFilter selected={dateFilter} setSelected={setDateFilter} />
        }
        columns={columns}
        title="Recent Verifications"
        rowLabel="verification"
        pageSize={7}
        filterTabs={STATUS_FILTERS}
        filterCounts={FILTER_COUNTS}
        filterColumnKey="status"
        allTabValue="All Disputes"
      />

      <DetailPanel
        applicant={selectedDispute}
        open={dialogOpen}
        onApprove={() => setApproveOpen(true)}
        onReject={() => setRejectOpen(true)}
        onOpenChange={() => {
          setDialogOpen(false);
          setSelectedDispute(null);
        }}
      />

      <ApproveDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        applicantName={selectedDispute?.name || ""}
        accountType={selectedDispute?.accountType || ""}
        onApprove={async () => {
          await new Promise((r) => setTimeout(r, 1500));
          // TODO: call your API
        }}
      />

      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        applicantName={selectedDispute?.name || ""}
        applicationId={selectedDispute?.id || ""}
        orgName="Green Earth NGO"
        contactEmail={selectedDispute?.email || ""}
        onReject={async (reason, note) => {
          await new Promise((r) => setTimeout(r, 1500));
          console.log("Rejected:", reason, note);
          // TODO: call your API
        }}
      />
    </>
  );
}
