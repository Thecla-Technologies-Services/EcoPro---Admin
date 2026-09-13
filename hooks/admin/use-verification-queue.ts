"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useUserDirectory } from "@/hooks/admin/use-user-directory";
import { useParamState } from "@/hooks/use-param-state";
import {
  usePendingRiders,
  useQueuedVerifications,
  useReviewOrganization,
  useReviewRider,
} from "@/hooks/admin/use-verification";
import { useOrganization } from "@/hooks/admin/use-organizations";
import { useUser } from "@/hooks/admin/use-users";
import {
  applicantKey,
  isAwaitingReview,
  toOrganizationApplicant,
  toQueueApplicant,
  toReviewerId,
  toReviewerName,
  toRejectionReason,
  withRiderDetail,
} from "@/lib/adapters/verification";
import { APPLICANTS } from "@/data/applicants";
import type { AdminVerificationMetricsDto } from "@/types/api/admin";
import type { Applicant } from "@/types/verification";

/** Which rows the queue shows. Reviewing calls the API either way. */
export type QueueSource = "live" | "fixture";

/**
 * How many applications the queue asks for at once.
 *
 * The endpoint pages, but the screen is a scrolling list beside a detail panel
 * rather than a paged table, so it takes one generous page. Worth revisiting as
 * a real page control if the queue ever runs past this.
 */
const QUEUE_PAGE_SIZE = 100;

/** What the verification page needs, whoever assembled the queue. */
export interface VerificationQueueState {
  rows: Applicant[];
  /** Never null while there are rows: the first one stands in. */
  selected: Applicant | null;
  /** The selected row's key, for marking the list item active. */
  activeKey: string | null;
  select: (key: string) => void;
  approve: () => Promise<void>;
  /** The dialog's picked reason and its free-text note, sent as one string. */
  reject: (reason: string, note: string) => Promise<void>;
  /**
   * Whether the selection can still be decided. False for an application
   * already approved or rejected, which the queue keeps and the two pending
   * endpoints do not — so this list is the only one where a decided row is on
   * screen at all, and the only one that has to stop offering the decision.
   */
  canReview: boolean;
  /** The queue's own counts, when the endpoint supplied them. */
  metrics?: AdminVerificationMetricsDto;
  /**
   * True while the selected row's evidence is still loading. The row itself is
   * already on screen, so this dims the detail panel rather than the list.
   */
  isDetailPending: boolean;
  query: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
}

/**
 * The Verification Queue: one list, a selection, and the two decisions an Admin
 * User can make about it.
 *
 * The list is `GET /verification/queue`, which reports organizations and riders
 * together — including the ones already decided, and who decided them, neither
 * of which the two pending endpoints can describe. What it does not carry is the
 * evidence: no documents, no payout account, no ID number. So the selected row
 * is filled in from its own record — an organization from
 * `GET /verification/organizations/{organizationId}`, fetched per selection; a
 * rider from the pending-rider queue joined to the user directory for its name.
 *
 * Both queues are reviewed the same way through different endpoints, so the
 * row's `kind` picks the mutation and the id it expects. That is the reason
 * `approve` and `reject` exist rather than the endpoints being handed out: a
 * caller holding both mutations has to know which id each wants.
 */
export function useVerificationQueue({
  source = "live",
}: { source?: QueueSource } = {}): VerificationQueueState {
  const queue = useQueuedVerifications(undefined, undefined, {
    pageNumber: 1,
    pageSize: QUEUE_PAGE_SIZE,
  });

  const live = source === "live";

  const liveRows = useMemo(
    () => (queue.data?.queue?.data ?? []).map(toQueueApplicant),
    [queue.data],
  );

  const rows = live ? liveRows : APPLICANTS;

  /**
   * The selection lives in the URL, so a reviewer can link someone to the
   * application they are asking about and a refresh keeps the row open. It is
   * the composite `applicantKey` rather than a bare id: organization ids and
   * rider-profile ids come from different tables, and the kind is what tells
   * the two apart.
   */
  const [selectedKey, setSelectedKey] = useParamState("applicant");

  // Falling back to the first row rather than storing it means the panel is
  // never blank, and a reviewed row dropping out of the queue advances to the
  // next one instead of leaving a selection pointing at nothing.
  const summary =
    rows.find((row) => applicantKey(row) === selectedKey) ?? rows[0] ?? null;

  /**
   * Put the standing selection in the URL, so the address bar names the row on
   * screen whether it was clicked or fallen back to.
   *
   * This covers two arrivals: landing with no param at all, which opens the
   * first application; and a param naming a row that is no longer in the queue,
   * which would otherwise leave the URL pointing at one row while the panel
   * shows another. With no rows there is nothing to name, and the param is left
   * alone rather than cleared — the queue may simply not have loaded yet.
   */
  useEffect(() => {
    if (!summary) return;

    const key = applicantKey(summary);
    if (key !== selectedKey) setSelectedKey(key);
  }, [summary, selectedKey, setSelectedKey]);

  // Detail is fetched only for a live queue: a fixture row already carries its
  // documents, and asking the API about its invented id would fail for a row
  // that renders perfectly well without it.
  const detailFor = live ? summary : null;

  const organization = useOrganization(
    detailFor?.kind === "organization" ? detailFor.id : undefined,
  );

  /**
   * Riders have no per-record endpoint — the pending queue is the only place a
   * profile exists — and it carries no name, so the directory is joined in.
   *
   * Unlike the organization detail these are not per-selection: both are whole
   * lists, and a hook cannot be called conditionally, so they load with the
   * page. Neither is wasted — the riders module and the users table read the
   * same two keys, so this usually resolves from cache.
   */
  const isRider = detailFor?.kind === "rider";
  const riders = usePendingRiders();
  const users = useUserDirectory();

  const detailed = useMemo(() => {
    if (!summary || !detailFor) return summary;

    if (detailFor.kind === "organization") {
      // The queue row is the better source for the reviewer and for a decided
      // status, so the detail is layered under it rather than over it.
      return organization.data
        ? {
            ...toOrganizationApplicant(organization.data),
            status: summary.status,
            reviewer: summary.reviewer,
            reviewDate: summary.reviewDate,
          }
        : summary;
    }

    if (detailFor.kind === "rider") {
      const profile = (riders.data ?? []).find(
        (row) => row.id === detailFor.id,
      );
      const user = (users.data ?? []).find((row) => row.id === profile?.userId);
      return withRiderDetail(summary, profile, user);
    }

    return summary;
  }, [summary, detailFor, organization.data, riders.data, users.data]);

  /**
   * `reviewedBy` is an account id, and the footer that reports a decision wants
   * a person — so the account is fetched and its name used in place of the id.
   *
   * Only for the selection: it is the one row that shows a reviewer, and one
   * request per decided row in the list would buy nothing. Disabled outright
   * when the field already reads as a name.
   */
  const reviewerAccount = useUser(toReviewerId(detailed?.reviewer));

  const selected = useMemo(() => {
    if (!detailed) return detailed;

    const reviewer = toReviewerName(detailed.reviewer, reviewerAccount.data);
    // Keep the row's identity when the lookup changed nothing — a fixture row
    // already names its reviewer, and reallocating it on every render would
    // defeat the memoisation downstream.
    return reviewer === detailed.reviewer ? detailed : { ...detailed, reviewer };
  }, [detailed, reviewerAccount.data]);

  const reviewOrganization = useReviewOrganization();
  const reviewRider = useReviewRider();

  const review = useCallback(
    async (approved: boolean, rejection?: { reason: string; note: string }) => {
      if (!selected) return;

      const rejectionReason = rejection
        ? toRejectionReason(rejection.reason, rejection.note)
        : undefined;

      if (selected.kind === "organization") {
        const note = rejection?.note.trim();

        await reviewOrganization.mutateAsync({
          organizationId: selected.id,
          approve: approved,
          // This endpoint models the two halves the dialog collects, so they go
          // as themselves — a category anything server-side can group by, and
          // the note on its own. `rejectionReason` carries the same content as
          // one sentence, for whatever reads that field.
          rejectionCategory: rejection?.reason,
          additionalNotes: note || undefined,
          rejectionReason,
        });
        return;
      }

      if (selected.kind === "rider") {
        // `ReviewRiderRequestDto` has only the one field, so a rider's category
        // and note have nowhere to go but the combined string.
        await reviewRider.mutateAsync({
          riderProfileId: selected.id,
          approve: approved,
          rejectionReason,
        });
        return;
      }

      // Neither vocabulary matched the queue's `applicantType`, so there is no
      // endpoint to send this to. Saying so beats picking one at random.
      throw new Error(
        `This application's type ("${selected.accountType}") does not match either review endpoint, so it cannot be decided here.`,
      );
    },
    [selected, reviewOrganization, reviewRider],
  );

  return {
    rows,
    selected,
    activeKey: selected ? applicantKey(selected) : null,
    select: setSelectedKey,
    canReview: isAwaitingReview(selected),
    approve: useCallback(() => review(true), [review]),
    reject: useCallback(
      (reason: string, note: string) => review(false, { reason, note }),
      [review],
    ),
    metrics: live ? queue.data?.metrics : undefined,
    // `isLoading`, not `isPending`: a disabled query stays pending forever, so a
    // row the detail can never be fetched for — an organization whose queue row
    // carries no id — would dim the panel permanently, which is exactly the case
    // that also has no bank account and no documents to show.
    isDetailPending: Boolean(
      detailFor &&
      (detailFor.kind === "organization"
        ? organization.isLoading
        : isRider && (riders.isLoading || users.isLoading)),
    ),
    query: {
      // Fixture rows are in hand immediately, so nothing about them can be in
      // flight — whatever the endpoint behind them happens to be doing.
      isPending: live && queue.isPending,
      isError: live && queue.isError,
      error: queue.error,
      refetch: () => {
        queue.refetch();
      },
    },
  };
}
