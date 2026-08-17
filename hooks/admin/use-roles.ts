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
  CreateRoleRequestDto,
  DeleteRoleRequestDto,
  GroupedPermissionDto,
  RoleDetailsDto,
  RoleListResponseDto,
  UpdateRoleRequestDto,
} from "@/types/api/admin";

/** GET /api/admin/roles */
export function useRoles(filters?: AdminQueryFilters) {
  return useQuery({
    queryKey: adminKeys.roles.list(filters),
    queryFn: () =>
      apiFetch<RoleListResponseDto>(
        `/roles${buildQueryString(paginationParams(filters))}`
      ),
  });
}

/** GET /api/admin/roles/{roleId} */
export function useRole(roleId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.roles.detail(roleId ?? ""),
    queryFn: () => apiFetch<RoleDetailsDto>(`/roles/${roleId}`),
    enabled: Boolean(roleId),
  });
}

/**
 * GET /api/admin/roles/permissions — the catalogue of assignable permissions,
 * grouped for display. Effectively static, so it is cached for the session.
 */
export function usePermissionCatalogue() {
  return useQuery({
    queryKey: adminKeys.roles.permissions(),
    queryFn: () => apiFetch<GroupedPermissionDto[]>("/roles/permissions"),
    staleTime: Infinity,
  });
}

/** POST /api/admin/roles */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRoleRequestDto) =>
      apiFetch<RoleDetailsDto>("/roles", { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles.all });
    },
  });
}

/** PUT /api/admin/roles/{roleId} */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, ...body }: UpdateRoleRequestDto & { roleId: string }) =>
      apiFetch<RoleDetailsDto>(`/roles/${roleId}`, { method: "PUT", body }),
    onSuccess: (_data, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.roles.all });
    },
  });
}

/** DELETE /api/admin/roles/{roleId} */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, ...body }: DeleteRoleRequestDto & { roleId: string }) =>
      apiFetch<string>(`/roles/${roleId}`, { method: "DELETE", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles.all });
    },
  });
}
