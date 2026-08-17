"use client";

import { useMemo } from "react";
import { Package, Truck } from "lucide-react";
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
 * queues are readable — there is no endpoint for approved or rejected history,
 * so those cards show a placeholder rather than a number we cannot source.
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

  const pendingCount = rows.filter(
    (row) => row.status === "Pending Review",
  ).length;

  const isPending = organizations.isPending || riders.isPending;

  const retry = () => {
    organizations.refetch();
    riders.refetch();
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title>Verification Queue</PageHeader.Title>
          <PageHeader.Description>
            Review and approve partner applications
          </PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>

      {/* Only the pending figure is fetched; the placeholder cards have nothing
          in flight, so showing them a skeleton would promise a number that is
          never coming. */}
      <StatGrid>
        <SharedStatCard
          label="Total Applications"
          value={UNAVAILABLE}
          icon={IoCartOutline}
        />
        <SharedStatCard
          label="Pending Review"
          value={pendingCount}
          icon={Package}
          isLoading={isPending}
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
