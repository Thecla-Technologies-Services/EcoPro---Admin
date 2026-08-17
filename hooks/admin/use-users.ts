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
  AdminEditUserRequestDto,
  AdminUserDetailsDto,
  AdminUserListResponseDto,
  AdminUserListingItemDtoPaginatedResponseDto,
  AdminUserTransactionDtoPaginatedResponseDto,
  CreateAdminUserRequestDto,
  DeleteUserRequestDto,
  SuspendUserRequestDto,
  UserDto,
} from "@/types/api/admin";

/** GET /api/admin/users */
export function useUsers(tab?: string, filters?: AdminQueryFilters) {
  return useQuery({
    queryKey: adminKeys.users.list(tab, filters),
    queryFn: () =>
      apiFetch<AdminUserListResponseDto>(
        `/users${buildQueryString({ Tab: tab, ...paginationParams(filters) })}`
      ),
    // Keep the current page visible while the next one loads, so paging and
    // tab switches don't blank the table.
    placeholderData: keepPreviousData,
  });
}

/** GET /api/admin/users/{userId} */
export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.users.detail(userId ?? ""),
    queryFn: () => apiFetch<AdminUserDetailsDto>(`/users/${userId}`),
    enabled: Boolean(userId),
  });
}

/** GET /api/admin/users/{userId}/listings */
export function useUserListings(
  userId: string | undefined,
  listingType?: string,
  filters?: AdminQueryFilters
) {
  return useQuery({
    queryKey: adminKeys.users.listings(userId ?? "", listingType, filters),
    queryFn: () =>
      apiFetch<AdminUserListingItemDtoPaginatedResponseDto>(
        `/users/${userId}/listings${buildQueryString({
          listingType,
          ...paginationParams(filters),
        })}`
      ),
    enabled: Boolean(userId),
  });
}

/** GET /api/admin/users/{userId}/transactions */
export function useUserTransactions(
  userId: string | undefined,
  transactionType?: string,
  filters?: AdminQueryFilters
) {
  return useQuery({
    queryKey: adminKeys.users.transactions(userId ?? "", transactionType, filters),
    queryFn: () =>
      apiFetch<AdminUserTransactionDtoPaginatedResponseDto>(
        `/users/${userId}/transactions${buildQueryString({
          transactionType,
          ...paginationParams(filters),
        })}`
      ),
    enabled: Boolean(userId),
  });
}

/** POST /api/admin/users/create-regular-user */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAdminUserRequestDto) =>
      apiFetch<UserDto>("/users/create-regular-user", { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}

/** PUT /api/admin/users/{userId} */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      ...body
    }: AdminEditUserRequestDto & { userId: string }) =>
      apiFetch<UserDto>(`/users/${userId}`, { method: "PUT", body }),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}

/** DELETE /api/admin/users/{userId} */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ...body }: DeleteUserRequestDto & { userId: string }) =>
      apiFetch<string>(`/users/${userId}`, { method: "DELETE", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}

/** POST /api/admin/users/{userId}/suspend */
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ...body }: SuspendUserRequestDto & { userId: string }) =>
      apiFetch<string>(`/users/${userId}/suspend`, { method: "POST", body }),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}

/** POST /api/admin/users/{userId}/unsuspend */
export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<string>(`/users/${userId}/unsuspend`, { method: "POST" }),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}
