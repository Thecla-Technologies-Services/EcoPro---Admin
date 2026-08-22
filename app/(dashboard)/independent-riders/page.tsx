"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataState } from "@/components/shared/data-state";
import IndependentRidersTable from "@/components/dashboard/independent-riders/independent-riders-table";
import { useIndependentRiders } from "@/hooks/admin/use-independent-riders";

export default function IndependentRidersPage() {
  const { rows, query } = useIndependentRiders();

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title>Independent Riders</PageHeader.Title>
          <PageHeader.Description>
            View independent riders
          </PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>

      <DataState>
        <DataState.Error
          when={query.isError}
          error={query.error}
          onRetry={query.refetch}
        />
        {/* The table owns its own loading branch, so it is handed the flag
            rather than being swapped out for a skeleton here. */}
        <DataState.Content>
          <IndependentRidersTable data={rows} isLoading={query.isLoading} />
        </DataState.Content>
      </DataState>
    </div>
  );
}
