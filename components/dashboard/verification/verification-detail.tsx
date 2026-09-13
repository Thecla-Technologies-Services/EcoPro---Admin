"use client";

import {
  ApplicantDetail,
  DetailBlock,
  DocumentList,
  FactCard,
  useApplicantRecord,
} from "./applicant-detail";
// Temporarily out. Re-enable both this and the section below together — the
// import is commented rather than deleted so lint doesn't flag it as unused.
// import { OrganizationDonations } from "./organization-donations";
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
  // `accountStatus` is deliberately not taken here: this panel's badge is the
  // state of the application under review, and an organization's account being
  // Active says nothing about whether its application was approved.
  const { bank, userCode, isPending } = useApplicantRecord(applicant);

  const record = applicant && { ...applicant, userCode };

  return (
    <ApplicantDetail applicant={record} isPending={isPending}>
      {/* Always shown, even before the payout account has loaded — an absent
          row reads as "this applicant has no bank details", which is a
          different claim from "we have not fetched them yet". */}
      <DetailBlock title="Bank Accounts">
        <FactCard
          loading={isPending}
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

      {/* <OrganizationDonations applicant={applicant} /> */}

      <DetailBlock title="Uploaded Documents">
        <DocumentList documents={applicant?.documents} />
      </DetailBlock>
    </ApplicantDetail>
  );
}
