"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import { adminKeys } from "@/lib/api/query-keys";
import type { UserDto } from "@/types/api/admin";

/**
 * GET /api/user/get-all — every account on the platform, unnarrowed.
 *
 * The Independent Riders page is built from this list. The admin users list can
 * now select riders — `Role=IndependentRider` — but `AdminUserSummaryDto` still
 * carries no country and no phone number, and `RiderProfileDto` carries no name,
 * country, email or phone at all, so the identity record remains the only source
 * for the columns that page renders.
 *
 * It takes no pagination, search or filter parameters: the whole list comes back
 * and the narrowing happens in the caller. That is the reason to move this onto
 * the admin endpoint if those two fields ever appear there.
 */
export function useUserDirectory() {
  return useQuery({
    queryKey: adminKeys.users.directory(),
    queryFn: () => apiFetch<UserDto[]>("/get-all", { service: "user" }),
    staleTime: 60_000,
  });
}
