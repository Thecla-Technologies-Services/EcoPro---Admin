"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { RowActions } from "@/components/shared/row-actions";
import { DataTable } from "@/components/shared/data-table";
import { DataState } from "@/components/shared/data-state";
import { useListPanel } from "@/hooks/shared/use-list-panel";
import { usePendingWithdrawals } from "@/hooks/admin/use-payouts";
import { toWithdrawalRequest } from "@/lib/adapters/wallet";
import { Amount } from "@/components/shared/amount";
import DateRangeFilter from "@/components/shared/date/date-range-filter";
import { StatusBadge } from "@/components/shared/status-badge";
import { ViewWithdrawalDialog } from "./view-withdrawal-dialog";
import { ApproveWithdrawalDialog } from "./approve-withdrawal-dialog";
import { RejectWithdrawalDialog } from "./reject-withdrawal-dialog";
import { type WithdrawalRequest } from "@/types/wallet";
import { DateRangeFilterValue } from "@/types/date";

type DialogType = "view" | "approve" | "reject" | null;

/**
 * Which statuses can be acted on.
 *
 * The endpoint serves the pending queue, and the API's vocabulary has two
 * spellings for that — `Pending` and `PendingReview`, the latter being a
 * withdrawal held back by the review threshold. Both are still undecided, so
 * both can be approved or rejected.
 */
const DECIDABLE = new Set(["Pending", "Pending Review"]);

function ActionsCell({
  row,
  onAction,
}: {
  row: WithdrawalRequest;
  onAction: (type: DialogType, row: WithdrawalRequest) => void;
}) {
  const isDecidable = DECIDABLE.has(row.status);

  return (
    <RowActions>
      <RowActions.Item icon={Eye} onSelect={() => onAction("view", row)}>
        View Withdrawal
      </RowActions.Item>

      {isDecidable && (
        <>
          <RowActions.Item
            icon={CheckCircle}
            onSelect={() => onAction("approve", row)}
          >
            Approve Withdrawal
          </RowActions.Item>
          <RowActions.Item
            icon={XCircle}
            destructive
            onSelect={() => onAction("reject", row)}
          >
            Reject Withdrawal
          </RowActions.Item>
        </>
      )}
    </RowActions>
  );
}

function buildColumns(
  onAction: (type: DialogType, row: WithdrawalRequest) => void,
): ColumnDef<WithdrawalRequest>[] {
  return [
    {
      accessorKey: "reference",
      header: "Transaction ID",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <Amount amount={row.original.amount} currency={row.original.currency} />
      ),
    },
    {
      accessorKey: "fee",
      header: "Fee",
      cell: ({ row }) => (
        <Amount amount={row.original.fee} currency={row.original.currency} />
      ),
    },
    {
      accessorKey: "accountName",
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
const PAGE_SIZE = 7;

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

  /**
   * `GET /payout-settings/withdrawals/pending` accepts no paging, search or
   * filters and returns the whole queue, so all three happen here.
   */
  const panel = useListPanel({
    paging: "client",
    pageSize: PAGE_SIZE,
    initialFilters: { tab: ALL_TAB },
    useQuery: () => {
      const query = usePendingWithdrawals();
      return { rows: query.data ?? [], ...query };
    },
    toRow: toWithdrawalRequest,
    // `DataTable` carries no search field of its own, so the only filter the
    // panel applies here is the tab.
    matches: (row, _term, { tab }) =>
      !tab || tab === ALL_TAB || row.status === tab,
  });

  /**
   * Tabs come from the statuses actually present, not a fixed list.
   *
   * A written-down `Approved` / `Rejected` pair would sit there permanently
   * empty: this endpoint only serves undecided requests, and a decided one
   * leaves the list with no endpoint that reads it back. An empty tab reads as
   * "there are none", which would be a claim the API never made.
   */
  const tabs = React.useMemo(() => {
    const present = [...new Set(panel.rows.map((row) => row.status))].sort();
    return [ALL_TAB, ...present];
  }, [panel.rows]);

  const filterCounts = React.useMemo(
    () =>
      tabs.reduce<Record<string, number>>(
        (counts, tab) => ({
          ...counts,
          [tab]:
            tab === ALL_TAB
              ? panel.rows.length
              : panel.rows.filter((row) => row.status === tab).length,
        }),
        {},
      ),
    [tabs, panel.rows],
  );

  return (
    <>
      <DataState>
        <DataState.Error
          when={panel.query.isError}
          error={panel.query.error}
          onRetry={panel.query.refetch}
        />
        <DataState.Loading when={panel.query.isPending} rows={4} />
        <DataState.Content>
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
            pageSize={PAGE_SIZE}
            rowLabel="requests"
            hideSortIcon={["actions"]}
            allTabValue={ALL_TAB}
            title="Pending Withdrawal Requests"
            filterTabs={tabs}
            filterCounts={filterCounts}
            headerExtra={
              <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
            }
          />
        </DataState.Content>
      </DataState>

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
