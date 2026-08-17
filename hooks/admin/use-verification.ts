"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { buildQueryString } from "@/lib/api/params";
import { adminKeys } from "@/lib/api/query-keys";
import type {
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
      queryClient.invalidateQueries({
        queryKey: adminKeys.verification.pendingOrganizations(),
      });
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
      queryClient.invalidateQueries({
        queryKey: adminKeys.verification.pendingRiders(),
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}
