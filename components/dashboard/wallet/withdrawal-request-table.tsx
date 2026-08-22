"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { RowActions } from "@/components/shared/row-actions";
import { DataTable } from "@/components/shared/data-table";
import { useFixturePanel } from "@/hooks/shared/use-fixture-panel";
import { WITHDRAWAL_REQUESTS } from "@/data/withdrawals";
import DateRangeFilter from "@/components/shared/date/date-range-filter";
import { StatusBadge } from "@/components/shared/status-badge";
import { ViewWithdrawalDialog } from "./view-withdrawal-dialog";
import { ApproveWithdrawalDialog } from "./approve-withdrawal-dialog";
import { RejectWithdrawalDialog } from "./reject-withdrawal-dialog";
import { type WithdrawalRequest } from "@/types/wallet";
import { DateRangeFilterValue } from "@/types/date";

type DialogType = "view" | "approve" | "reject" | null;

function ActionsCell({
  row,
  onAction,
}: {
  row: WithdrawalRequest;
  onAction: (type: DialogType, row: WithdrawalRequest) => void;
}) {
  const isPending = row.status === "Pending";
  const isRejected = row.status === "Rejected";

  return (
    <RowActions>
      <RowActions.Item icon={Eye} onSelect={() => onAction("view", row)}>
        View Withdrawal
      </RowActions.Item>

      {(isPending || isRejected) && (
        <RowActions.Item
          icon={CheckCircle}
          onSelect={() => onAction("approve", row)}
        >
          Approve Withdrawal
        </RowActions.Item>
      )}

      {isPending && (
        <RowActions.Item
          icon={XCircle}
          destructive
          onSelect={() => onAction("reject", row)}
        >
          Reject Withdrawal
        </RowActions.Item>
      )}
    </RowActions>
  );
}

function buildColumns(
  onAction: (type: DialogType, row: WithdrawalRequest) => void,
): ColumnDef<WithdrawalRequest>[] {
  return [
    {
      accessorKey: "requestId",
      header: "Transaction ID",
    },
    {
      accessorKey: "userId",
      header: "User ID",
    },
    {
      accessorKey: "user",
      header: "User",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) =>
        `₦${row.original.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
    },
    {
      accessorKey: "fullName",
      header: "Account Name",
    },
    {
      accessorKey: "bankName",
      header: "Bank Name",
    },
    {
      accessorKey: "accountNumber",
      header: "Account Number",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <ActionsCell row={row.original} onAction={onAction} />,
    },
  ];
}

const ALL_TAB = "All";
const TABS = [ALL_TAB, "Pending", "Approved", "Rejected"] as const;

export function WithdrawalRequestTable() {
  const [activeRow, setActiveRow] = React.useState<WithdrawalRequest | null>(
    null,
  );
  const [dateFilter, setDateFilter] = React.useState<
    DateRangeFilterValue | undefined
  >(undefined);
  const [openDialog, setOpenDialog] = React.useState<DialogType>(null);

  function handleAction(type: DialogType, row: WithdrawalRequest) {
    setActiveRow(row);
    setOpenDialog(type);
  }

  function closeAll() {
    setOpenDialog(null);
    // keep activeRow so closing animation doesn't flicker
  }

  function switchTo(type: DialogType) {
    setOpenDialog(type);
  }

  const columns = React.useMemo(() => buildColumns(handleAction), []);

  const panel = useFixturePanel({
    rows: WITHDRAWAL_REQUESTS,
    pageSize: 7,
    initialFilters: { tab: ALL_TAB },
    matches: (row, _term, { tab }) => tab === ALL_TAB || row.status === tab,
  });

  /**
   * Counted from the rows rather than written down. The figures here used to be
   * literals that disagreed with what the table showed.
   */
  const filterCounts = React.useMemo(
    () =>
      TABS.reduce<Record<string, number>>(
        (counts, tab) => ({
          ...counts,
          [tab]:
            tab === ALL_TAB
              ? WITHDRAWAL_REQUESTS.length
              : WITHDRAWAL_REQUESTS.filter((row) => row.status === tab).length,
        }),
        {},
      ),
    [],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={panel.table.data}
        manualPagination
        pagination={panel.table.pagination}
        onPaginationChange={panel.table.onPaginationChange}
        totalPages={panel.table.totalPages}
        totalCount={panel.table.totalCount}
        activeTab={panel.table.activeTab}
        onTabChange={panel.table.onTabChange}
        pageSize={7}
        rowLabel="requests"
        hideSortIcon={["actions"]}
        allTabValue={ALL_TAB}
        title="Pending Withdrawal Requests"
        filterTabs={TABS}
        filterCounts={filterCounts}
        headerExtra={
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
        }
      />

      {/* ── Dialogs ── */}
      <ViewWithdrawalDialog
        open={openDialog === "view"}
        onOpenChange={(o) => !o && closeAll()}
        request={activeRow}
        onApprove={() => switchTo("approve")}
      />

      <ApproveWithdrawalDialog
        open={openDialog === "approve"}
        onOpenChange={(o) => !o && closeAll()}
        request={activeRow}
        onReject={() => switchTo("reject")}
      />

      <RejectWithdrawalDialog
        open={openDialog === "reject"}
        onOpenChange={(o) => !o && closeAll()}
        request={activeRow}
        onBack={() => switchTo("approve")}
      />
    </>
  );
}
