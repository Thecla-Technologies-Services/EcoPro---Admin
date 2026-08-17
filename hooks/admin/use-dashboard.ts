"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import {
  buildQueryString,
  paginationParams,
  type AdminQueryFilters,
} from "@/lib/api/params";
import { adminKeys } from "@/lib/api/query-keys";
import type {
  DashboardActionRequiredDtoPaginatedResponseDto,
  DashboardOverviewDto,
  MonthlyFinancialOverviewDto,
} from "@/types/api/admin";

/** GET /api/admin/dashboard/overview */
export function useDashboardOverview() {
  return useQuery({
    queryKey: adminKeys.dashboard.overview(),
    queryFn: () => apiFetch<DashboardOverviewDto>("/dashboard/overview"),
  });
}

/** GET /api/admin/dashboard/financial-overview */
export function useFinancialOverview(filter?: string) {
  return useQuery({
    queryKey: adminKeys.dashboard.financialOverview(filter),
    queryFn: () =>
      apiFetch<MonthlyFinancialOverviewDto[]>(
        `/dashboard/financial-overview${buildQueryString({ filter })}`
      ),
  });
}

/** GET /api/admin/dashboard/action-required */
export function useActionRequired(filters?: AdminQueryFilters) {
  return useQuery({
    queryKey: adminKeys.dashboard.actionRequired(filters),
    queryFn: () =>
      apiFetch<DashboardActionRequiredDtoPaginatedResponseDto>(
        `/dashboard/action-required${buildQueryString(paginationParams(filters))}`
      ),
  });
}
