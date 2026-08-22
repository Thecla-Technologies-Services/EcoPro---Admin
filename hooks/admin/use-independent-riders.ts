"use client";

import { useMemo } from "react";
import { useUserDirectory } from "@/hooks/admin/use-admin-users";
import { usePendingRiders } from "@/hooks/admin/use-verification";
import { toRiderQueue } from "@/lib/adapters/verification";
import type { Applicant } from "@/types/verification";

/** What the Independent Riders table needs, whoever assembled it. */
export interface IndependentRidersState {
  rows: Applicant[];
  query: {
    /** True on first load and on every refetch — the table dims, not unmounts. */
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
}

/**
 * Every Independent Rider on the platform, with whatever verification evidence
 * each one has pending.
 *
 * The same two endpoints as the Verification Queue, joined the other way round.
 * There the pending profiles are the list and the directory only supplies names,
 * so losing the directory costs names; here the directory *is* the list — no
 * admin endpoint returns riders, so they are found by filtering it on account
 * type — and the pending profiles only supply documents, the UTR and the
 * provider's result. So the fatal failure is the opposite one, and that is why
 * this is its own module rather than an option on the queue's.
 */
export function useIndependentRiders(): IndependentRidersState {
  const users = useUserDirectory();
  const riders = usePendingRiders();

  const rows = useMemo(
    () => toRiderQueue(users.data, riders.data),
    [users.data, riders.data],
  );

  return {
    rows,
    query: {
      isLoading: users.isPending || users.isFetching,
      // A rider with nothing pending is already rendered without documents, so
      // the whole queue failing is the same case at a larger scale — the rows
      // still stand.
      isError: users.isError,
      error: users.error,
      refetch: () => {
        users.refetch();
        riders.refetch();
      },
    },
  };
}
