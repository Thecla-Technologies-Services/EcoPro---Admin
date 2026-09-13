"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ExternalLink, PencilLine } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { DataState } from "@/components/shared/data-state";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListPanel } from "@/hooks/shared/use-list-panel";
import { useSupportTickets } from "@/hooks/admin/use-support";
import { toSupportTicket } from "@/lib/adapters/support";
import {
  ALL_TICKET_STATUSES,
  TICKET_STATUS_TABS,
  toTicketStatusParam,
} from "@/constants/support-ticket-status";
import { ResolveTicketDialog } from "./resolve-ticket-dialog";
import type { SupportTicket } from "@/types/support";

const PAGE_SIZE = 10;

function buildColumns(
  onUpdate: (row: SupportTicket) => void,
): ColumnDef<SupportTicket>[] {
  return [
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-100">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "date",
      header: "Raised",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <RowActions>
          <RowActions.Item
            icon={PencilLine}
            onSelect={() => onUpdate(row.original)}
          >
            Update Status
          </RowActions.Item>
          {row.original.attachmentUrl && (
            <RowActions.Item
              icon={ExternalLink}
              onSelect={() =>
                window.open(
                  row.original.attachmentUrl,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              Open Attachment
            </RowActions.Item>
          )}
        </RowActions>
      ),
    },
  ];
}

/**
 * Support tickets, from `GET /support/tickets`.
 *
 * The endpoint pages and filters by status server-side. It accepts a
 * `SearchTerm` too, which the panel supplies — `DataTable` has no search field
 * of its own, so nothing types into it yet, but the parameter is wired rather
 * than dropped.
 */
export function SupportTicketTable() {
  const [activeRow, setActiveRow] = React.useState<SupportTicket | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const columns = React.useMemo(
    () =>
      buildColumns((row) => {
        setActiveRow(row);
        setDialogOpen(true);
      }),
    [],
  );

  const panel = useListPanel({
    pageSize: PAGE_SIZE,
    initialFilters: { tab: ALL_TICKET_STATUSES },
    useQuery: ({ pagination, search, filters }) => {
      const query = useSupportTickets(
        toTicketStatusParam(filters.tab ?? ALL_TICKET_STATUSES),
        {
          pageNumber: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          searchTerm: search || undefined,
        },
      );

      return {
        rows: query.data?.data ?? [],
        totalPages: query.data?.totalPages,
        totalCount: query.data?.totalRecords,
        ...query,
      };
    },
    toRow: toSupportTicket,
  });

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
            rowLabel="tickets"
            hideSortIcon={["actions"]}
            allTabValue={ALL_TICKET_STATUSES}
            title="Support Tickets"
            filterTabs={TICKET_STATUS_TABS}
          />
        </DataState.Content>
      </DataState>

      <ResolveTicketDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ticket={activeRow}
      />
    </>
  );
}
