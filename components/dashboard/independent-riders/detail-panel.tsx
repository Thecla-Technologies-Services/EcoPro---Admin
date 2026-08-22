"use client";

import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DetailDialog } from "@/components/shared/detail-dialog";
import {
  ApplicantDetail,
  DetailBlock,
  DocumentList,
  FactCard,
  useApplicantBank,
} from "@/components/dashboard/verification/applicant-detail";
import { type Applicant } from "@/types/verification";

/**
 * A rider's verification record, read-only.
 *
 * Strictly a view of what the rider submitted and what the third-party
 * verification service returned — there is deliberately no approve or reject
 * here. Decisions are made in the verification queue, which is the one place
 * that holds the review mutations.
 */
export default function DetailPanel({
  applicant,
  open,
  onOpenChange,
}: {
  applicant: Applicant | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const bank = useApplicantBank(applicant);

  return (
    // Wider than the shell's default: the header runs a name and a full email
    // address side by side, which has nowhere to go at 2xl.
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-3xl!"
    >
      <ApplicantDetail
        applicant={applicant}
        titleAs={DialogTitle}
        descriptionAs={DialogDescription}
        // Every row on this page is a rider, so an account-type pill beside the
        // name would only repeat the page title.
        badge={null}
      >
        <DetailBlock title="Bank Accounts">
          <FactCard
            items={[
              { label: "Account Name:", value: bank?.accountName ?? "—" },
              { label: "Account Number:", value: bank?.accountNumber ?? "—" },
              { label: "Bank:", value: bank?.bankName ?? "—" },
            ]}
          />
        </DetailBlock>

        {/* The admin API exposes no rider service areas or pricing, so this
            says so rather than being dropped — a missing section reads as "this
            rider covers nowhere", which is a different claim. */}
        <DetailBlock title="Available Locations & Pricing">
          <FactCard
            items={applicant?.locations ?? []}
            empty="Locations and pricing are not available yet."
          />
        </DetailBlock>

        <DetailBlock title="Uploaded Verification Documents">
          <DocumentList
            documents={applicant?.documents}
            empty="No verification documents were submitted."
          />
        </DetailBlock>

        <DetailBlock
          when={!!applicant?.rejectionReason}
          title="Rejection Reason"
        >
          <p className="rounded-xl bg-white px-4 py-6 text-base text-muted-foreground">
            {applicant?.rejectionReason}
          </p>
        </DetailBlock>
      </ApplicantDetail>
    </DetailDialog>
  );
}
