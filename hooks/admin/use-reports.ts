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
  ListingReportDto,
  ListingReportDtoPaginatedResponseDto,
  ListingReportStatus,
  ReportDto,
  ReportDtoPaginatedResponseDto,
  ReportStatus,
  ResolveListingReportRequestDto,
  ResolveReportRequestDto,
} from "@/types/api/admin";

/** GET /api/admin/reports — user reports. */
export function useReports(status?: ReportStatus, filters?: AdminQueryFilters) {
  return useQuery({
    queryKey: adminKeys.reports.list(status, filters),
    queryFn: () =>
      apiFetch<ReportDtoPaginatedResponseDto>(
        `/reports${buildQueryString({ status, ...paginationParams(filters) })}`
      ),
  });
}

/** POST /api/admin/reports/{id}/resolve */
export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: ResolveReportRequestDto & { id: string }) =>
      apiFetch<ReportDto>(`/reports/${id}/resolve`, { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports.all });
      // Resolving clears an item from the dashboard's action-required list.
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}

/** GET /api/admin/listing-reports — reports raised against listings. */
export function useListingReports(
  status?: ListingReportStatus,
  filters?: AdminQueryFilters
) {
  return useQuery({
    queryKey: adminKeys.listingReports.list(status, filters),
    queryFn: () =>
      apiFetch<ListingReportDtoPaginatedResponseDto>(
        `/listing-reports${buildQueryString({ Status: status, ...paginationParams(filters) })}`
      ),
  });
}

/** POST /api/admin/listing-reports/{id}/resolve */
export function useResolveListingReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: ResolveListingReportRequestDto & { id: string }) =>
      apiFetch<ListingReportDto>(`/listing-reports/${id}/resolve`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listingReports.all });
      // A resolution can hide or remove the listing it was raised against.
      queryClient.invalidateQueries({ queryKey: adminKeys.listings.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}
