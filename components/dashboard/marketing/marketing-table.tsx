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
import { DateRangeFilter } from "@/components/shared/date/date-range-filter";
import { TableSearchInput } from "@/components/shared/table-search-input";
import type { DateRangeFilterValue } from "@/types/date";

type TabFilter = "All Campaigns" | "Active" | "Scheduled" | "Paused" | "Ended";

const ALL_TAB: TabFilter = "All Campaigns";

const TABS: readonly TabFilter[] = [
  ALL_TAB,
  "Active",
  "Scheduled",
  "Paused",
  "Ended",
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
  const [activeTab, setActiveTab] = React.useState<TabFilter>(ALL_TAB);
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState<
    DateRangeFilterValue | undefined
  >();

  // Counted from the rows rather than written beside each label, so a tab's
  // count cannot drift from what selecting it shows.
  const counts = React.useMemo(
    () =>
      campaigns.reduce<Record<string, number>>(
        (totals, campaign) => ({
          ...totals,
          [campaign.status]: (totals[campaign.status] ?? 0) + 1,
        }),
        {},
      ),
    [campaigns],
  );

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      if (activeTab !== ALL_TAB && campaign.status !== activeTab) return false;
      if (!term) return true;

      return [campaign.campaignName, campaign.placement, campaign.status].some(
        (field) => field.toLowerCase().includes(term),
      );
    });
  }, [campaigns, activeTab, search]);

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
      // The tabs are the table's own, which puts them at the left of the header
      // and leaves `headerExtra` for the controls that belong on the right.
      filterTabs={TABS}
      filterCounts={counts}
      allTabValue={ALL_TAB}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as TabFilter)}
      headerExtra={
        <div className="flex flex-wrap items-center gap-3">
          {/* NOTE: held but not applied. Every fixture campaign carries the same
              start and end date, so filtering by a range would empty the table
              rather than narrow it — campaigns reach no endpoint at all yet. */}
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />

          <TableSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search campaigns"
            className="mt-0 w-full md:mt-0 md:w-56"
          />
        </div>
      }
    />
  );
}
