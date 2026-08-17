"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import DateRangeFilter from "@/components/shared/date-range-filter";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background rounded-md"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1 py-2 space-y-2">
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer"
          onClick={() => onAction("view", row)}
        >
          <Eye className="size-5 text-foreground" />
          View Withdrawal
        </DropdownMenuItem>

        {(isPending || isRejected) && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm cursor-pointer"
            onClick={() => onAction("approve", row)}
          >
            <CheckCircle className="size-5 text-foreground  " />
            Approve Withdrawal
          </DropdownMenuItem>
        )}

        {isPending && (
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm cursor-pointer text-destructive focus:text-red-500"
            onClick={() => onAction("reject", row)}
          >
            <XCircle className="size-5 text-foreground" />
            Reject Withdrawal
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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

const SAMPLE_DATA: WithdrawalRequest[] = Array.from({ length: 20 }, (_, i) => ({
  requestId: "WD-53156908",
  userId: "USR-1245",
  user: "Tayo Igbira",
  fullName: "Tayo Igbira Adewale",
  bankName: "Access Bank PLC",
  accountNumber: "0123672348",
  amount: 125000,
  status: (["Pending", "Approved", "Rejected"] as const)[i % 3],
  date: "Feb 7, 2026, 11:23 PM",
  note:
    i % 3 === 2
      ? "The request was rejected because the account number provided is incorrect."
      : undefined,
}));

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

  const filterCounts = {
    All: SAMPLE_DATA.length,
    Pending: 12,
    Approved: 23,
    Rejected: 6,
  };

  const tabs = ["All", "Pending", "Approved", "Rejected"] as const;

  return (
    <>
      <DataTable
        columns={columns}
        data={SAMPLE_DATA}
        pageSize={7}
        rowLabel="requests"
        hideSortIcon={["actions"]}
        allTabValue="All"
        title="Pending Withdrawal Requests"
        filterTabs={tabs}
        filterCounts={filterCounts}
        headerExtra={
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
        }
        filterColumnKey="status"
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
