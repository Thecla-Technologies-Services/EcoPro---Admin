"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { adminKeys } from "@/lib/api/query-keys";
import { selectAdminUsers, toAdminUserRow } from "@/lib/adapters/user";
import type { UserDto } from "@/types/api/admin";

/**
 * GET /api/user/get-all — every account on the platform, narrowed to staff.
 *
 * The admin service lists users only by All/Individual/NGO/Delivery/Suspended,
 * with no tab or filter for admins, so this is the only endpoint that can answer
 * "who are the admins". It takes no pagination, search or filter parameters:
 * the whole list comes back and the narrowing happens here.
 *
 * That is acceptable while staff accounts are a handful of the total. If this
 * list ever gets large, the fix is a paginated admin-side endpoint rather than a
 * bigger client-side filter.
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users.admins(),
    queryFn: async () => {
      const users = await apiFetch<UserDto[]>("/get-all", { service: "user" });
      return selectAdminUsers(users ?? []).map(toAdminUserRow);
    },
    staleTime: 60_000,
  });
}
