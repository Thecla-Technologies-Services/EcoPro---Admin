"use client";

import {
  ApplicantDetail,
  DetailBlock,
  DocumentList,
  FactCard,
  useApplicantBank,
} from "./applicant-detail";
import { type Applicant } from "@/types/verification";

/**
 * What a reviewer needs to decide on one application: who it is, where the
 * payout goes, and the documents backing it up. The decision buttons stay with
 * the page, which owns the mutations.
 */
export function VerificationDetail({
  applicant,
}: {
  applicant: Applicant | null;
}) {
  const bank = useApplicantBank(applicant);

  return (
    <ApplicantDetail applicant={applicant}>
      {/* Always shown, even before the payout account has loaded — an absent
          row reads as "this applicant has no bank details", which is a
          different claim from "we have not fetched them yet". */}
      <DetailBlock title="Bank Accounts">
        <FactCard
          items={[
            { label: "Account Name:", value: bank?.accountName ?? "—" },
            { label: "Account Number:", value: bank?.accountNumber ?? "—" },
            { label: "Bank:", value: bank?.bankName ?? "—" },
          ]}
        />
      </DetailBlock>

      <DetailBlock when={!!applicant?.rejectionReason} title="Rejection Reason">
        <p className="rounded-xl bg-white px-4 py-6 text-base text-muted-foreground">
          {applicant?.rejectionReason}
        </p>
      </DetailBlock>

      <DetailBlock title="Uploaded Documents">
        <DocumentList documents={applicant?.documents} />
      </DetailBlock>
    </ApplicantDetail>
  );
}
