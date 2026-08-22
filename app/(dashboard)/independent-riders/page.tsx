"use client";

import { useMemo } from "react";
import { Truck } from "lucide-react";
import { IoCartOutline } from "react-icons/io5";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import { DataState } from "@/components/shared/data-state";
import SharedStatCard from "@/components/shared/stat-card";
import VerificationTable from "@/components/dashboard/verification/verification-table";
import {
  usePendingOrganizations,
  usePendingRiders,
} from "@/hooks/admin/use-verification";
import { toVerificationQueue } from "@/lib/adapters/verification";

/**
 * Stands in for counters the Admin API does not expose. Only the two pending
 * queues are readable — there is no endpoint for application totals or for
 * approved and rejected history, so these cards show a placeholder rather than
 * a number we cannot source.
 */
const UNAVAILABLE = "—";

export default function VerificationPage() {
  const organizations = usePendingOrganizations();
  const riders = usePendingRiders();

  const rows = useMemo(
    () => toVerificationQueue(organizations.data, riders.data),
    [organizations.data, riders.data],
  );

  // Either queue failing leaves the page showing a partial list, which would
  // read as "nothing left to review" — so surface the failure instead.
  const failed = organizations.isError
    ? organizations
    : riders.isError
      ? riders
      : null;

  const isPending = organizations.isPending || riders.isPending;

  const retry = () => {
    organizations.refetch();
    riders.refetch();
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title>Independent Riders</PageHeader.Title>
          <PageHeader.Description>
            View independent rider applications
          </PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>

      {/* None of these figures are fetched, so the cards have nothing in
          flight — a skeleton would promise a number that is never coming. */}
      {/* Three cards, so the shared 2-up-below-lg grid would leave a hole:
          stack them full-width on phones and go straight to 3-up at md. */}
      <StatGrid columns={3} className="grid-cols-1 md:grid-cols-3">
        <SharedStatCard
          label="Total Applications"
          value={UNAVAILABLE}
          icon={IoCartOutline}
        />
        <SharedStatCard label="Approved" value={UNAVAILABLE} icon={Truck} />
        <SharedStatCard
          label="Rejected"
          value={UNAVAILABLE}
          icon={HiOutlineDocumentCheck}
        />
      </StatGrid>

      <DataState>
        <DataState.Error
          when={!!failed}
          error={failed?.error}
          onRetry={retry}
        />
        <DataState.Content>
          <VerificationTable
            data={rows}
            isLoading={
              isPending || organizations.isFetching || riders.isFetching
            }
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
