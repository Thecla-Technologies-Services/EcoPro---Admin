"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  PauseCircle,
  CheckCircle,
} from "lucide-react";
import { RowActions } from "@/components/shared/row-actions";
import { DataTable } from "@/components/shared/data-table";
import { type EscrowTransaction } from "@/types/wallet";
import { ForceReleaseDialog } from "./force-release-dialog";
import { PauseEscrowDialog } from "./pause-escrow-dialog";
import { OpenDisputeDialog } from "./open-dispute-dialog";
import { StatusBadge } from "@/components/shared/status-badge";

type EscrowDialog = "dispute" | "release" | "pause" | null;



function ActionsCell({ onAction }: { onAction: (type: EscrowDialog) => void }) {
  return (
    <RowActions>
      <RowActions.Item icon={AlertTriangle} onSelect={() => onAction("dispute")}>
        Open Dispute
      </RowActions.Item>
      <RowActions.Item icon={CheckCircle} onSelect={() => onAction("release")}>
        Force Release Payment
      </RowActions.Item>
      <RowActions.Item icon={PauseCircle} onSelect={() => onAction("pause")}>
        Pause Escrow
      </RowActions.Item>
    </RowActions>
  );
}


function buildColumns(
  onAction: (type: EscrowDialog) => void,
): ColumnDef<EscrowTransaction>[] {
  return [
    {
      accessorKey: "orderId",
      header: "Order ID",
    },
    {
      accessorKey: "item",
      header: "Item",
    },
    {
      accessorKey: "buyer",
      header: "Buyer",
    },
    {
      accessorKey: "seller",
      header: "Seller",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) =>
        `₦${row.original.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "held",
      header: "Held",
    },
    {
      accessorKey: "dateCreated",
      header: "Date Created",
    },
    {
      id: "actions",
      header: "",
      cell: () => <ActionsCell onAction={onAction} />,
    },
  ];
}



const SAMPLE_DATA: EscrowTransaction[] = Array.from({ length: 14 }, (_, i) => ({
  orderId: "TRX123-012",
  item: "Iphone 15 Pro Max",
  buyer: "Tayo Igbira",
  seller: "Adejumo Adeyemi",
  amount: 180000,
  status: (["In Transit", "Delivered", "In Transit", "Paused"] as const)[i % 4],
  held: "For 2 days",
  dateCreated: "Feb 7, 2026",
}));



export function EscrowManagementTable() {
  const [openDialog, setOpenDialog] = React.useState<EscrowDialog>(null);

  function closeAll() {
    setOpenDialog(null);
  }

  const columns = React.useMemo(
    () => buildColumns((type) => setOpenDialog(type)),
    [],
  );

  const tabs = ["All", "Pending (23)", "Completed"] as const;

  return (
    <>
      <DataTable
        columns={columns}
        data={SAMPLE_DATA}
        pageSize={7}
        rowLabel="transactions"
        hideSortIcon={["actions"]}
        title="Active Transactions"
        filterTabs={tabs}
        filterColumnKey="status"
        allTabValue="All"
      />

      {/* ── Dialogs ── */}
      <OpenDisputeDialog
        open={openDialog === "dispute"}
        onOpenChange={(o) => !o && closeAll()}
      />
      <ForceReleaseDialog
        open={openDialog === "release"}
        onOpenChange={(o) => !o && closeAll()}
      />
      <PauseEscrowDialog
        open={openDialog === "pause"}
        onOpenChange={(o) => !o && closeAll()}
      />
    </>
  );
}
