"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import {
  buildQueryString,
  paginationParams,
  type AdminQueryFilters,
} from "@/lib/api/params";
import { adminKeys } from "@/lib/api/query-keys";
import type {
  AdminListingItemDto,
  AdminListingListResponseDto,
  CreateAdminListingRequestDto,
  FlagListingRequestDto,
} from "@/types/api/admin";

/** GET /api/admin/listings */
export function useListings(tab?: string, filters?: AdminQueryFilters) {
  return useQuery({
    queryKey: adminKeys.listings.list(tab, filters),
    queryFn: () =>
      apiFetch<AdminListingListResponseDto>(
        `/listings${buildQueryString({ Tab: tab, ...paginationParams(filters) })}`
      ),
    // Keep the current page visible while the next one loads.
    placeholderData: keepPreviousData,
  });
}

/** GET /api/admin/listings/{listingId} */
export function useListing(listingId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.listings.detail(listingId ?? ""),
    queryFn: () => apiFetch<AdminListingItemDto>(`/listings/${listingId}`),
    enabled: Boolean(listingId),
  });
}

/** POST /api/admin/listings */
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAdminListingRequestDto) =>
      apiFetch<AdminListingItemDto>("/listings", { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings.all });
    },
  });
}

/** DELETE /api/admin/listings/{listingId} */
export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) =>
      apiFetch<string>(`/listings/${listingId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings.all });
    },
  });
}

/** POST /api/admin/listings/{listingId}/flag */
export function useFlagListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listingId,
      ...body
    }: FlagListingRequestDto & { listingId: string }) =>
      apiFetch<AdminListingItemDto>(`/listings/${listingId}/flag`, {
        method: "POST",
        body,
      }),
    onSuccess: (_data, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings.detail(listingId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.listings.all });
    },
  });
}

/** POST /api/admin/listings/{listingId}/unflag */
export function useUnflagListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) =>
      apiFetch<AdminListingItemDto>(`/listings/${listingId}/unflag`, {
        method: "POST",
      }),
    onSuccess: (_data, listingId) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings.detail(listingId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.listings.all });
    },
  });
}
