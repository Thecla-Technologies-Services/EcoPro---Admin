"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { type OrderStatus } from "@/types/order-swap";
import DetailPanel from "./detail-panel";
import { DataTable } from "@/components/shared/data-table";
import { DataState } from "@/components/shared/data-state";
import { RowActions } from "@/components/shared/row-actions";
import { Skeleton } from "@/components/ui/skeleton";
import TableDateFilter from "../../shared/table-date-filter";
import { ApproveDialog } from "./approve-dialog";
import { RejectDialog } from "./reject-dialog";
import { DateRangeFilterValue } from "@/types/date";
import { type Applicant } from "@/types/verification";
import { toRejectionReason } from "@/lib/adapters/verification";
import { useReviewOrganization, useReviewRider } from "@/hooks/admin/use-verification";

const STATUS_FILTERS = [
  "All Applications",
  "Pending Review",
  "Approved",
  "Rejected",
] as const;

const PAGE_SIZE = 7;

interface VerificationTableProps {
  data: Applicant[];
  isLoading?: boolean;
}

export default function VerificationTable({
  data,
  isLoading,
}: VerificationTableProps) {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const [dateFilter, setDateFilter] = useState<
    DateRangeFilterValue | undefined
  >(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const reviewOrganization = useReviewOrganization();
  const reviewRider = useReviewRider();

  /**
   * Both queues are reviewed the same way but through different endpoints, so
   * the row's `kind` picks the mutation and the id it expects.
   */
  const review = async (
    applicant: Applicant,
    approve: boolean,
    rejectionReason?: string,
  ) => {
    if (applicant.kind === "organization") {
      await reviewOrganization.mutateAsync({
        organizationId: applicant.id,
        approve,
        rejectionReason,
      });
      return;
    }

    await reviewRider.mutateAsync({
      riderProfileId: applicant.id,
      approve,
      rejectionReason,
    });
  };

  /** A reviewed applicant leaves the pending queue, so the detail sheet behind
   * the confirmation would be showing a row that no longer exists. */
  const reviewAndCloseDetail = async (
    approve: boolean,
    rejectionReason?: string,
  ) => {
    if (!selectedApplicant) return;
    await review(selectedApplicant, approve, rejectionReason);
    setDialogOpen(false);
  };

  const counts = useMemo(() => {
    const tally: Record<string, number> = {
      "All Applications": data.length,
      "Pending Review": 0,
      Approved: 0,
      Rejected: 0,
    };

    for (const applicant of data) {
      if (applicant.status in tally && applicant.status !== "All Applications") {
        tally[applicant.status] += 1;
      }
    }
    return tally;
  }, [data]);

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
          const applicant = row.original;
          return (
            <RowActions>
              <RowActions.Item
                icon={Eye}
                onSelect={() => {
                  setSelectedApplicant(applicant);
                  setDialogOpen(true);
                }}
              >
                View Details
              </RowActions.Item>
            </RowActions>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <DataState>
        {/* First load has nothing to dim, so it gets placeholders instead. */}
        <DataState.Loading
          when={isLoading && !data.length}
          className="rounded-lg bg-white p-4"
        >
          <Skeleton className="h-9 w-full max-w-md" />
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </DataState.Loading>
        {/* Dim rather than unmount while a refetch is in flight, so approving a
            row doesn't collapse the table and jump the layout. */}
        <DataState.Content busy={isLoading}>
          <DataTable
            data={data}
            headerExtra={
              <TableDateFilter
                selected={dateFilter}
                setSelected={setDateFilter}
              />
            }
            columns={columns}
            title="Recent Verifications"
            rowLabel="verification"
            pageSize={PAGE_SIZE}
            filterTabs={STATUS_FILTERS}
            filterCounts={counts}
            filterColumnKey="status"
            allTabValue="All Applications"
          />
        </DataState.Content>
      </DataState>

      <DetailPanel
        applicant={selectedApplicant}
        open={dialogOpen}
        onApprove={() => setApproveOpen(true)}
        onReject={() => setRejectOpen(true)}
        onOpenChange={() => {
          setDialogOpen(false);
          setSelectedApplicant(null);
        }}
      />

      <ApproveDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        applicantName={selectedApplicant?.name || ""}
        accountType={selectedApplicant?.accountType || ""}
        onApprove={() => reviewAndCloseDetail(true)}
      />

      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        applicantName={selectedApplicant?.name || ""}
        applicationId={selectedApplicant?.id || ""}
        orgName={selectedApplicant?.name || ""}
        contactEmail={selectedApplicant?.email || ""}
        onReject={(reason, note) =>
          reviewAndCloseDetail(false, toRejectionReason(reason, note))
        }
      />
    </>
  );
}
