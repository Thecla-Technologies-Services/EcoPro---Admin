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
  AdminVerificationListResponseDto,
  Country,
  OrganizationDto,
  ReviewOrganizationRequestDto,
  ReviewRiderRequestDto,
  RiderProfileDto,
  UpdateVerificationMethodRequestDto,
  VerificationMethodConfigDto,
} from "@/types/api/admin";

/** GET /api/admin/verification/methods */
export function useVerificationMethods(country?: Country) {
  return useQuery({
    queryKey: adminKeys.verification.methods(country),
    queryFn: () =>
      apiFetch<VerificationMethodConfigDto[]>(
        `/verification/methods${buildQueryString({ country })}`
      ),
  });
}

/** PUT /api/admin/verification/methods */
export function useUpdateVerificationMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateVerificationMethodRequestDto) =>
      apiFetch<VerificationMethodConfigDto>("/verification/methods", {
        method: "PUT",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.verification.all });
    },
  });
}

/**
 * GET /api/admin/verification/queue
 *
 * Organizations and riders in one paginated list, with the queue's metrics
 * alongside them. Named for the endpoint rather than the screen: the page reads
 * `useVerificationQueue` (hooks/admin/use-verification-queue.ts), which is a
 * selection and two decisions over a queue, not a list query.
 *
 * The rows here carry the applicant's name, type and contact details but none
 * of the evidence a review needs — no documents, no bank account, no ID number.
 * Those still come from the per-kind pending endpoints below.
 */
export function useQueuedVerifications(
  tab?: string,
  applicantType?: string,
  filters?: AdminQueryFilters & { dateFrom?: string; dateTo?: string }
) {
  return useQuery({
    queryKey: adminKeys.verification.queue(tab, filters),
    queryFn: () =>
      apiFetch<AdminVerificationListResponseDto>(
        `/verification/queue${buildQueryString({
          Tab: tab,
          ApplicantType: applicantType,
          DateFrom: filters?.dateFrom,
          DateTo: filters?.dateTo,
          ...paginationParams(filters),
        })}`
      ),
    // Keep the current page visible while the next one loads.
    placeholderData: keepPreviousData,
  });
}

/** GET /api/admin/verification/organizations/pending */
export function usePendingOrganizations() {
  return useQuery({
    queryKey: adminKeys.verification.pendingOrganizations(),
    queryFn: () =>
      apiFetch<OrganizationDto[]>("/verification/organizations/pending"),
  });
}

/** POST /api/admin/verification/organizations/{organizationId}/review */
export function useReviewOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      ...body
    }: ReviewOrganizationRequestDto & { organizationId: string }) =>
      apiFetch<OrganizationDto>(
        `/verification/organizations/${organizationId}/review`,
        { method: "POST", body }
      ),
    onSuccess: () => {
      // Widened from the one pending list to the whole domain because the
      // joined queue reads the same decision through a different key.
      queryClient.invalidateQueries({ queryKey: adminKeys.verification.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}

/** GET /api/admin/verification/riders/pending */
export function usePendingRiders() {
  return useQuery({
    queryKey: adminKeys.verification.pendingRiders(),
    queryFn: () => apiFetch<RiderProfileDto[]>("/verification/riders/pending"),
  });
}

/** POST /api/admin/verification/riders/{riderProfileId}/review */
export function useReviewRider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      riderProfileId,
      ...body
    }: ReviewRiderRequestDto & { riderProfileId: string }) =>
      apiFetch<RiderProfileDto>(
        `/verification/riders/${riderProfileId}/review`,
        { method: "POST", body }
      ),
    onSuccess: () => {
      // Widened from the one pending list to the whole domain because the
      // joined queue reads the same decision through a different key.
      queryClient.invalidateQueries({ queryKey: adminKeys.verification.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}
