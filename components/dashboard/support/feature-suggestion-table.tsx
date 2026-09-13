"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { DataState } from "@/components/shared/data-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListPanel } from "@/hooks/shared/use-list-panel";
import { useFeatureSuggestions } from "@/hooks/admin/use-support";
import { toFeatureSuggestion } from "@/lib/adapters/support";
import type { FeatureSuggestion } from "@/types/support";

const PAGE_SIZE = 10;

const COLUMNS: ColumnDef<FeatureSuggestion>[] = [
  {
    accessorKey: "title",
    header: "Suggestion",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-100">{row.original.description}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "date",
    header: "Submitted",
  },
];

/**
 * Feature suggestions, from `GET /support/feature-suggestions`.
 *
 * Read-only, and there is no kebab column because there is nothing to put in
 * it: the admin API lists suggestions but exposes no endpoint that changes one,
 * so the status shown here is set elsewhere.
 */
export function FeatureSuggestionTable() {
  const panel = useListPanel({
    pageSize: PAGE_SIZE,
    useQuery: ({ pagination, search }) => {
      const query = useFeatureSuggestions({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        searchTerm: search || undefined,
      });

      return {
        rows: query.data?.data ?? [],
        totalPages: query.data?.totalPages,
        totalCount: query.data?.totalRecords,
        ...query,
      };
    },
    toRow: toFeatureSuggestion,
  });

  return (
    <DataState>
      <DataState.Error
        when={panel.query.isError}
        error={panel.query.error}
        onRetry={panel.query.refetch}
      />
      <DataState.Loading when={panel.query.isPending} rows={4} />
      <DataState.Content>
        <DataTable
          columns={COLUMNS}
          data={panel.table.data}
          manualPagination
          pagination={panel.table.pagination}
          onPaginationChange={panel.table.onPaginationChange}
          totalPages={panel.table.totalPages}
          totalCount={panel.table.totalCount}
          pageSize={PAGE_SIZE}
          rowLabel="suggestions"
          title="Feature Suggestions"
        />
      </DataState.Content>
    </DataState>
  );
}
