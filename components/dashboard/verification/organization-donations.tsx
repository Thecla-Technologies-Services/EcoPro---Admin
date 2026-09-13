"use client";

import { DetailBlock, FactCard } from "./applicant-detail";
import { DataState } from "@/components/shared/data-state";
import { useOrganizationDonations } from "@/hooks/admin/use-organizations";
import { formatDate } from "@/lib/adapters/shared";
import type { Applicant } from "@/types/verification";

/** How many of the most recent donations the panel shows. */
const PAGE_SIZE = 5;

/**
 * An organization's donated listings, from
 * `GET /verification/organizations/{organizationId}/donations`.
 *
 * Only for an organization: the endpoint is keyed by organizationId, and a
 * rider has none. Shown alongside the documents because what a charity partner
 * has already listed is part of deciding on it — and because this is the only
 * screen that holds an organizationId to ask with.
 */
export function OrganizationDonations({
  applicant,
}: {
  applicant: Applicant | null;
}) {
  const isOrganization = applicant?.kind === "organization";

  const query = useOrganizationDonations(
    isOrganization ? applicant.id : undefined,
    { pageNumber: 1, pageSize: PAGE_SIZE },
  );

  if (!isOrganization) return null;

  const donations = query.data?.data ?? [];
  const total = query.data?.totalRecords ?? donations.length;

  return (
    <DetailBlock
      title={total ? `Donations (${total})` : "Donations"}
    >
      <DataState>
        <DataState.Error
          when={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
        />
        <DataState.Loading when={query.isPending} rows={2} rowClassName="h-12" />
        <DataState.Content>
          <FactCard
            items={donations.map((donation) => ({
              label: donation.title ?? "Untitled listing",
              // The listing endpoint reports a relative age, not a date, so
              // that is what is shown rather than a timestamp it never sent.
              value:
                donation.publishedTimeAgo ??
                formatDate(undefined, "Date unknown"),
            }))}
            empty="This organization has not listed any donations yet."
          />
        </DataState.Content>
      </DataState>
    </DetailBlock>
  );
}
