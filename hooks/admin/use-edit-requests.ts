"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { buildQueryString } from "@/lib/api/params";
import { adminKeys } from "@/lib/api/query-keys";
import type {
  Country,
  EditRequestDto,
  EditRequestStatus,
  EditRequestTarget,
  ReviewEditRequestDto,
  UserType,
} from "@/types/api/admin";

export interface EditRequestQuery {
  status?: EditRequestStatus;
  target?: EditRequestTarget;
  country?: Country;
  userType?: UserType;
}

/** GET /api/admin/edit-requests */
export function useEditRequests(query: EditRequestQuery = {}) {
  return useQuery({
    queryKey: adminKeys.editRequests.list(query),
    queryFn: () =>
      apiFetch<EditRequestDto[]>(`/edit-requests${buildQueryString({ ...query })}`),
  });
}

/** GET /api/admin/edit-requests/{id} */
export function useEditRequest(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.editRequests.detail(id ?? ""),
    queryFn: () => apiFetch<EditRequestDto>(`/edit-requests/${id}`),
    enabled: Boolean(id),
  });
}

/** POST /api/admin/edit-requests/{id}/approve */
export function useApproveEditRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<EditRequestDto>(`/edit-requests/${id}/approve`, { method: "POST" }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.editRequests.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.editRequests.all });
      // An approved edit changes the underlying user record.
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}

/** POST /api/admin/edit-requests/{id}/reject */
export function useRejectEditRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: ReviewEditRequestDto & { id: string }) =>
      apiFetch<EditRequestDto>(`/edit-requests/${id}/reject`, {
        method: "POST",
        body,
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.editRequests.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.editRequests.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}
