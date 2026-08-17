"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  PauseCircle,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { type EscrowTransaction } from "@/types/wallet";
import { ForceReleaseDialog } from "./force-release-dialog";
import { PauseEscrowDialog } from "./pause-escrow-dialog";
import { OpenDisputeDialog } from "./open-dispute-dialog";
import { StatusBadge } from "@/components/shared/status-badge";

type EscrowDialog = "dispute" | "release" | "pause" | null;



function ActionsCell({ onAction }: { onAction: (type: EscrowDialog) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background rounded-md"
        >
          <span className="sr-only">Open menu</span>
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1 py-2 space-y-2">
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer px-2 "
          onClick={() => onAction("dispute")}
        >
          <AlertTriangle className="size-5 text-foreground" />
          Open Dispute
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer px-2 "
          onClick={() => onAction("release")}
        >
          <CheckCircle className="size-5 text-foreground" />
          Force Release Payment
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer px-2 "
          onClick={() => onAction("pause")}
        >
          <PauseCircle className="size-5 text-foreground" />
          Pause Escrow
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
