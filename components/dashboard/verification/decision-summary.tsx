import { StatusBadge } from "@/components/shared/status-badge";
import { fact } from "@/components/dashboard/verification/applicant-detail";
import { type Applicant } from "@/types/verification";

/**
 * What became of a decided application, in the band the Approve and Reject
 * buttons occupy while one is still pending.
 *
 * Only the verification queue can reach this: the two pending endpoints drop a
 * row the moment it is reviewed, so this list is the only place a decided
 * application is on screen — and the only one that reports `reviewedBy`.
 *
 * Every field here is optional in the API. Rather than laying out a row of
 * dashes, each absent one is simply left out, and with all of them absent the
 * band is the status alone — which is still more than the empty space the
 * buttons left behind.
 */
export function DecisionSummary({
  applicant,
}: {
  applicant: Applicant | null;
}) {
  if (!applicant) return null;

  const status = fact(applicant.status);
  const reviewer = fact(applicant.reviewer);
  const reviewDate = fact(applicant.reviewDate);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#CFD2D8] px-3 py-4 text-sm text-muted-foreground lg:justify-end lg:px-4 lg:py-5">
      {status && <StatusBadge status={status} />}
      {reviewer && (
        <span>
          by <span className="font-medium text-foreground">{reviewer}</span>
        </span>
      )}
      {reviewDate && (
        <>
          {/* Only a separator when there is something on both sides of it. */}
          {reviewer && <span aria-hidden>·</span>}
          <span className="font-medium text-foreground">{reviewDate}</span>
        </>
      )}
    </div>
  );
}
