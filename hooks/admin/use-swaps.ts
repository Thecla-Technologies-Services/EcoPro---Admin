"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import {
  buildQueryString,
  paginationParams,
  type AdminQueryFilters,
} from "@/lib/api/params";
import { adminKeys } from "@/lib/api/query-keys";
import type {
  ResolveSwapDisputeRequestDto,
  SwapEscrowSettingsDto,
  SwapProposalDto,
  SwapProposalDtoPaginatedResponseDto,
  UpdateSwapEscrowSettingsRequestDto,
} from "@/types/api/admin";

/** GET /api/admin/swaps/disputed */
export function useDisputedSwaps(filters?: AdminQueryFilters) {
  return useQuery({
    queryKey: adminKeys.swaps.disputed(filters),
    queryFn: () =>
      apiFetch<SwapProposalDtoPaginatedResponseDto>(
        `/swaps/disputed${buildQueryString(paginationParams(filters))}`
      ),
  });
}

/** POST /api/admin/swaps/{id}/resolve */
export function useResolveSwapDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: ResolveSwapDisputeRequestDto & { id: string }) =>
      apiFetch<SwapProposalDto>(`/swaps/${id}/resolve`, { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.swaps.all });
      // A resolution moves money, so the financial figures are stale too.
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}

/** GET /api/admin/swap-settings */
export function useSwapSettings() {
  return useQuery({
    queryKey: adminKeys.swaps.settings(),
    queryFn: () => apiFetch<SwapEscrowSettingsDto>("/swap-settings"),
  });
}

/** PUT /api/admin/swap-settings */
export function useUpdateSwapSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateSwapEscrowSettingsRequestDto) =>
      apiFetch<SwapEscrowSettingsDto>("/swap-settings", { method: "PUT", body }),
    onSuccess: (data) => {
      // The response is the updated settings, so seed the cache instead of
      // making the settings screen refetch what we already have.
      queryClient.setQueryData(adminKeys.swaps.settings(), data);
    },
  });
}
