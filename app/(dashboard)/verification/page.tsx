"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataState } from "@/components/shared/data-state";
import { Button } from "@/components/ui/button";
import QueueItem from "@/components/dashboard/verification/queue-item";
import { VerificationDetail } from "@/components/dashboard/verification/verification-detail";
import { ApproveDialog } from "@/components/dashboard/verification/approve-dialog";
import { RejectDialog } from "@/components/dashboard/verification/reject-dialog";
import {
  usePendingOrganizations,
  usePendingRiders,
  useReviewOrganization,
  useReviewRider,
} from "@/hooks/admin/use-verification";
import { useUserDirectory } from "@/hooks/admin/use-admin-users";
import {
  applicantKey,
  toRejectionReason,
  toVerificationQueue,
} from "@/lib/adapters/verification";
import { FIXTURE_QUEUE } from "@/data/verification";

export default function VerificationPage() {
  const organizations = usePendingOrganizations();
  const riders = usePendingRiders();
  // Rider profiles carry no name or email, so the directory is joined in to
  // name them. Only the rider rows depend on it.
  const users = useUserDirectory();

  const liveRows = useMemo(
    () => toVerificationQueue(organizations.data, riders.data, users.data),
    [organizations.data, riders.data, users.data],
  );

  /**
   * The queue's data source, chosen here rather than by a shared flag.
   *
   * The pending endpoints return nothing usable yet, so the rows are fixtures
   * and swapping this for `liveRows` is the whole change when they do. It is a
   * choice of rows only: reviewing still calls the API below, so an application
   * that cannot be reviewed says so instead of reporting a success that never
   * happened.
   */
  const rows = FIXTURE_QUEUE;

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  // Falling back to the first row rather than storing it means the panel is
  // never blank, and a reviewed row dropping out of the queue advances to the
  // next one instead of leaving a selection pointing at nothing.
  const selected =
    rows.find((row) => applicantKey(row) === selectedKey) ?? rows[0] ?? null;
  const activeKey = selected ? applicantKey(selected) : null;

  const reviewOrganization = useReviewOrganization();
  const reviewRider = useReviewRider();

  /**
   * Both queues are reviewed the same way but through different endpoints, so
   * the row's `kind` picks the mutation and the id it expects.
   */
  const review = async (approve: boolean, rejectionReason?: string) => {
    if (!selected) return;

    if (selected.kind === "organization") {
      await reviewOrganization.mutateAsync({
        organizationId: selected.id,
        approve,
        rejectionReason,
      });
      return;
    }

    await reviewRider.mutateAsync({
      riderProfileId: selected.id,
      approve,
      rejectionReason,
    });
  };

  // Fixture rows are in hand immediately; only a live queue can be in flight.
  const isPending =
    rows === liveRows &&
    (organizations.isPending || riders.isPending || users.isPending);

  return (
    <div className="flex w-full flex-col gap-6 overflow-x-hidden lg:h-full lg:min-h-0">
      <PageHeader className="shrink-0">
        <PageHeader.Heading>
          <PageHeader.Title>Verification Queue</PageHeader.Title>
          <PageHeader.Description>
            Review and approve partner applications
          </PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>

      <DataState>
        {/* The directory only supplies rider names — a failure there leaves
            nameless rows, which is worth showing rather than blocking on. */}
        <DataState.Error
          when={rows === liveRows && (organizations.isError || riders.isError)}
          error={organizations.error ?? riders.error}
          onRetry={() => {
            organizations.refetch();
            riders.refetch();
          }}
        />
        <DataState.Loading when={isPending} rows={6} rowClassName="h-20" />
        <DataState.Empty when={!rows.length}>
          Nothing is waiting for review.
        </DataState.Empty>
        <DataState.Content className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <div className="grid items-start gap-4 lg:h-full lg:min-h-0 lg:items-stretch lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)]">
            <aside className="flex flex-col overflow-hidden rounded-xl bg-background lg:h-full lg:min-h-0">
              <div className="shrink-0 px-3 py-4 lg:px-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Pending Applications
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rows.length} waiting for review
                </p>
              </div>

              <ul className="max-h-[70vh] flex-1 divide-y divide-border overflow-y-auto lg:max-h-none lg:min-h-0">
                {rows.map((row) => {
                  const key = applicantKey(row);
                  return (
                    <li key={key}>
                      <QueueItem
                        applicant={row}
                        isSelected={key === activeKey}
                        onClick={() => setSelectedKey(key)}
                      />
                    </li>
                  );
                })}
              </ul>
            </aside>

            <section className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-background lg:h-full lg:min-h-0">
              <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                <VerificationDetail applicant={selected} />
              </div>

              <div className="flex shrink-0 flex-col gap-3 border-t border-[#CFD2D8] px-3 py-4 lg:flex-row lg:justify-end lg:px-4 lg:py-5">
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive lg:w-50"
                  onClick={() => setRejectOpen(true)}
                >
                  Reject Application
                </Button>
                <Button className="lg:w-50" onClick={() => setApproveOpen(true)}>
                  Approve &amp; Activate
                </Button>
              </div>
            </section>
          </div>
        </DataState.Content>
      </DataState>

      <ApproveDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        applicantName={selected?.name || ""}
        accountType={selected?.accountType || ""}
        onApprove={() => review(true)}
      />

      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        applicantName={selected?.name || ""}
        applicationId={selected?.userCode || selected?.id || ""}
        orgName={selected?.name || ""}
        contactEmail={selected?.email || ""}
        onReject={(reason, note) =>
          review(false, toRejectionReason(reason, note))
        }
      />
    </div>
  );
}
