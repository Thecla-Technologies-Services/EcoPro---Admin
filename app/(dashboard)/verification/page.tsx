"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataState } from "@/components/shared/data-state";
import { Button } from "@/components/ui/button";
import QueueItem from "@/components/dashboard/verification/queue-item";
import { VerificationDetail } from "@/components/dashboard/verification/verification-detail";
import { ApproveDialog } from "@/components/dashboard/verification/approve-dialog";
import { RejectDialog } from "@/components/dashboard/verification/reject-dialog";
import { applicantKey } from "@/lib/adapters/verification";
import { useVerificationQueue } from "@/hooks/admin/use-verification-queue";

export default function VerificationPage() {
  // The pending endpoints return nothing usable yet, so the rows are fixtures
  // and this word is the whole change when they do. It chooses rows only:
  // approving and rejecting call the API either way, so an application that
  // cannot be reviewed says so rather than reporting a success that never
  // happened.
  const queue = useVerificationQueue({ source: "fixture" });
  const { rows, selected } = queue;

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

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
        <DataState.Error
          when={queue.query.isError}
          error={queue.query.error}
          onRetry={queue.query.refetch}
        />
        <DataState.Loading when={queue.query.isPending} rows={6} rowClassName="h-20" />
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
                        isSelected={key === queue.activeKey}
                        onClick={() => queue.select(key)}
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
        onApprove={queue.approve}
      />

      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        applicantName={selected?.name || ""}
        applicationId={selected?.userCode || selected?.id || ""}
        orgName={selected?.name || ""}
        contactEmail={selected?.email || ""}
        onReject={queue.reject}
      />
    </div>
  );
}
