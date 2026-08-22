"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataState } from "@/components/shared/data-state";
import IndependentRidersTable from "@/components/dashboard/independent-riders/independent-riders-table";
import { useUserDirectory } from "@/hooks/admin/use-admin-users";
import { usePendingRiders } from "@/hooks/admin/use-verification";
import { toRiderQueue } from "@/lib/adapters/verification";

export default function IndependentRidersPage() {
  // No admin endpoint returns riders, so the rows come from the user directory
  // filtered by account type.
  const users = useUserDirectory();
  // The pending-verification queue is what carries a rider's documents and the
  // provider's result, so it is joined in by user id. Riders with nothing
  // pending simply have no profile to show.
  const riders = usePendingRiders();

  const rows = useMemo(
    () => toRiderQueue(users.data, riders.data),
    [users.data, riders.data],
  );

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
          when={users.isError}
          error={users.error}
          onRetry={() => users.refetch()}
        />
        <DataState.Content>
          <IndependentRidersTable
            data={rows}
            isLoading={users.isPending || users.isFetching}
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
