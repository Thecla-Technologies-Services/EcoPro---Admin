"use client";

import { useCallback, useMemo, useState } from "react";
import { useUserDirectory } from "@/hooks/admin/use-admin-users";
import {
  usePendingOrganizations,
  usePendingRiders,
  useReviewOrganization,
  useReviewRider,
} from "@/hooks/admin/use-verification";
import {
  applicantKey,
  toRejectionReason,
  toVerificationQueue,
} from "@/lib/adapters/verification";
import { APPLICANTS } from "@/data/applicants";
import type { Applicant } from "@/types/verification";

/** Which rows the queue shows. Reviewing calls the API either way. */
export type QueueSource = "live" | "fixture";

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
  query: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
}

/**
 * The Verification Queue: three endpoints joined into one list, a selection,
 * and the two decisions an Admin User can make about it.
 *
 * The page was assembling all of this itself, which made the fixture/live
 * choice a comparison the page had to repeat — `rows === liveRows` guarded the
 * loading branch and the error branch separately, and getting either wrong
 * showed a skeleton over rows that were already in hand. Here the source is one
 * option, read once.
 *
 * Both queues are reviewed the same way through different endpoints, so the
 * row's `kind` picks the mutation and the id it expects. That is the reason
 * `approve` and `reject` exist rather than the endpoints being handed out: a
 * caller holding both mutations has to know which id each wants.
 */
export function useVerificationQueue({
  source = "live",
}: { source?: QueueSource } = {}): VerificationQueueState {
  const organizations = usePendingOrganizations();
  const riders = usePendingRiders();
  // Rider profiles carry no name or email, so the directory is joined in to
  // name them. Only the rider rows depend on it.
  const users = useUserDirectory();

  const live = source === "live";

  const liveRows = useMemo(
    () => toVerificationQueue(organizations.data, riders.data, users.data),
    [organizations.data, riders.data, users.data],
  );

  const rows = live ? liveRows : APPLICANTS;

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Falling back to the first row rather than storing it means the panel is
  // never blank, and a reviewed row dropping out of the queue advances to the
  // next one instead of leaving a selection pointing at nothing.
  const selected =
    rows.find((row) => applicantKey(row) === selectedKey) ?? rows[0] ?? null;

  const reviewOrganization = useReviewOrganization();
  const reviewRider = useReviewRider();

  const review = useCallback(
    async (approved: boolean, rejectionReason?: string) => {
      if (!selected) return;

      if (selected.kind === "organization") {
        await reviewOrganization.mutateAsync({
          organizationId: selected.id,
          approve: approved,
          rejectionReason,
        });
        return;
      }

      await reviewRider.mutateAsync({
        riderProfileId: selected.id,
        approve: approved,
        rejectionReason,
      });
    },
    [selected, reviewOrganization, reviewRider],
  );

  return {
    rows,
    selected,
    activeKey: selected ? applicantKey(selected) : null,
    select: setSelectedKey,
    approve: useCallback(() => review(true), [review]),
    reject: useCallback(
      (reason: string, note: string) =>
        review(false, toRejectionReason(reason, note)),
      [review],
    ),
    query: {
      // Fixture rows are in hand immediately, so nothing about them can be in
      // flight — whatever the endpoints happen to be doing behind them.
      isPending:
        live &&
        (organizations.isPending || riders.isPending || users.isPending),
      // The directory only supplies rider names. Losing it leaves nameless
      // rows, which is worth showing rather than blocking the whole queue on.
      isError: live && (organizations.isError || riders.isError),
      error: organizations.error ?? riders.error,
      refetch: () => {
        organizations.refetch();
        riders.refetch();
      },
    },
  };
}
