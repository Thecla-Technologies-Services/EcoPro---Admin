"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { buildQueryString } from "@/lib/api/params";
import { adminKeys } from "@/lib/api/query-keys";
import type {
  PayoutSettingsDto,
  UpdatePayoutSettingsRequestDto,
  WithdrawalRequestDto,
} from "@/types/api/admin";

/** GET /api/admin/payout-settings */
export function usePayoutSettings() {
  return useQuery({
    queryKey: adminKeys.payouts.settings(),
    queryFn: () => apiFetch<PayoutSettingsDto>("/payout-settings"),
  });
}

/** PUT /api/admin/payout-settings */
export function useUpdatePayoutSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePayoutSettingsRequestDto) =>
      apiFetch<PayoutSettingsDto>("/payout-settings", { method: "PUT", body }),
    onSuccess: (data) => {
      // The response is the saved settings, so seed the cache instead of making
      // the settings screen refetch what we already have.
      queryClient.setQueryData(adminKeys.payouts.settings(), data);
    },
  });
}

/**
 * GET /api/admin/payout-settings/withdrawals/pending
 *
 * Only what is still awaiting a decision, and unpaged — the endpoint takes no
 * pagination or search parameters, so filtering and paging these rows happens
 * in memory. There is no endpoint that lists decided withdrawals, so an
 * approved or rejected one leaves this list and cannot be read back.
 */
export function usePendingWithdrawals() {
  return useQuery({
    queryKey: adminKeys.payouts.pendingWithdrawals(),
    queryFn: () =>
      apiFetch<WithdrawalRequestDto[]>("/payout-settings/withdrawals/pending"),
  });
}

/** POST /api/admin/payout-settings/withdrawals/{withdrawalId}/approve */
export function useApproveWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (withdrawalId: string) =>
      apiFetch<WithdrawalRequestDto>(
        `/payout-settings/withdrawals/${withdrawalId}/approve`,
        { method: "POST" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.payouts.all });
      // Approving one moves money, so the dashboard's payout figures are stale.
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}

/**
 * POST /api/admin/payout-settings/withdrawals/{withdrawalId}/reject
 *
 * The reason is a query parameter rather than a body — the endpoint takes no
 * request body at all.
 */
export function useRejectWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      withdrawalId,
      reason,
    }: {
      withdrawalId: string;
      reason?: string;
    }) =>
      apiFetch<WithdrawalRequestDto>(
        `/payout-settings/withdrawals/${withdrawalId}/reject${buildQueryString({
          reason,
        })}`,
        { method: "POST" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.payouts.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}
