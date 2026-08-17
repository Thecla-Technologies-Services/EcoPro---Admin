"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  MoreVertical,
  Pencil,
  Pause,
  Copy,
  BarChart2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import type { Campaign } from "@/types/marketing";
import { StatusBadge } from "@/components/shared/status-badge";
import TabButton from "@/components/shared/tab-button";

type TabFilter = "All Campaigns" | "Active" | "Scheduled" | "Paused" | "Ended";

const TABS: { label: TabFilter; count?: number }[] = [
  { label: "All Campaigns" },
  { label: "Active", count: 2 },
  { label: "Scheduled", count: 1 },
  { label: "Paused", count: 1 },
  { label: "Ended", count: 1 },
];

interface CampaignsTableProps {
  campaigns: Campaign[];
  onViewAnalytics: (c: Campaign) => void;
  onDelete: (id: string) => void;
  onPause: (id: string) => void;
}

function BannerThumb({ url }: { url?: string }) {
  return (
    <div className="w-16 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="banner" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-100 via-blue-50 to-gray-200 flex items-center justify-center">
          <span className="text-[7px] text-gray-400 font-bold text-center leading-tight px-1">
            EASY FAST FRESH
          </span>
        </div>
      )}
    </div>
  );
}

function ActionsCell({
  row,
  onViewAnalytics,
  onDelete,
  onPause,
}: {
  row: Campaign;
  onViewAnalytics: (c: Campaign) => void;
  onDelete: (id: string) => void;
  onPause: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1">
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer"
          asChild
        >
          <Link href="/marketing/create-banner">
            <Pencil className="size-4 text-gray-400" />
            Edit Ad
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer"
          onClick={() => onPause(row.id)}
        >
          <Pause className="size-4 text-gray-400" />
          Pause
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer">
          <Copy className="size-4 text-gray-400" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer"
          onClick={() => onViewAnalytics(row)}
        >
          <BarChart2 className="size-4 text-gray-400" />
          View Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-sm cursor-pointer text-red-500 focus:text-red-500"
          onClick={() => onDelete(row.id)}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CampaignsTable({
  campaigns,
  onViewAnalytics,
  onDelete,
  onPause,
}: CampaignsTableProps) {
  const [activeTab, setActiveTab] = React.useState<TabFilter>("All Campaigns");

  const filtered = React.useMemo(() => {
    if (activeTab === "All Campaigns") return campaigns;
    return campaigns.filter((c) => c.status === activeTab);
  }, [campaigns, activeTab]);

  const columns: ColumnDef<Campaign>[] = React.useMemo(
    () => [
      {
        accessorKey: "sn",
        header: "S/N",
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">{row.index + 1}.</span>
        ),
      },
      {
        accessorKey: "bannerUrl",
        header: "Banner",
        cell: ({ row }) => <BannerThumb url={row.original.bannerUrl} />,
      },
      {
        accessorKey: "campaignName",
        header: "Campaign Name",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-gray-800">
            {row.original.campaignName}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "placement",
        header: "Placement",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.placement}
          </span>
        ),
      },
      {
        accessorKey: "clicks",
        header: "Clicks",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.clicks.toLocaleString() || "0"}
          </span>
        ),
      },
      {
        accessorKey: "ctr",
        header: "CTR",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.ctr ? `${row.original.ctr}%` : "0"}
          </span>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.startDate}
          </span>
        ),
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{row.original.endDate}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <ActionsCell
            row={row.original}
            onViewAnalytics={onViewAnalytics}
            onDelete={onDelete}
            onPause={onPause}
          />
        ),
      },
    ],
    [onViewAnalytics, onDelete, onPause],
  );

  return (
    <DataTable
      columns={columns}
      data={filtered}
      pageSize={7}
      rowLabel="campaigns"
      hideSortIcon={["sn", "bannerUrl", "actions"]}
      headerExtra={
        <div className="flex gap-2 flex-wrap pt-1">
          {TABS.map(({ label, count }) => (
            <TabButton
              key={label}
              onClick={() => setActiveTab(label)}
              active={activeTab === label}
            >
              {label}
              {count !== undefined ? ` (${count})` : ""}
            </TabButton>
          ))}
        </div>
      }
    />
  );
}
