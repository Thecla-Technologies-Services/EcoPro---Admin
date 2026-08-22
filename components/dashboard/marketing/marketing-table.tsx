"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Pencil,
  Pause,
  Copy,
  BarChart2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { RowActions } from "@/components/shared/row-actions";
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
    <RowActions>
      {/* asChild so the row's primary action stays a real link — right-click
          and open-in-new-tab keep working. */}
      <RowActions.Item asChild>
        <Link href="/marketing/create-banner">
          <Pencil className="mr-2 size-4 md:size-5" />
          Edit Ad
        </Link>
      </RowActions.Item>
      <RowActions.Item icon={Pause} onSelect={() => onPause(row.id)}>
        Pause
      </RowActions.Item>
      <RowActions.Item icon={Copy}>Duplicate</RowActions.Item>
      <RowActions.Item icon={BarChart2} onSelect={() => onViewAnalytics(row)}>
        View Analytics
      </RowActions.Item>
      <DropdownMenuSeparator />
      <RowActions.Item icon={Trash2} destructive onSelect={() => onDelete(row.id)}>
        Delete
      </RowActions.Item>
    </RowActions>
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
