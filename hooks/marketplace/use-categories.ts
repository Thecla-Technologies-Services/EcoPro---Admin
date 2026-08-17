"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";
import type { ApiResponse } from "@/types/auth";
import type { CategoryDto } from "@/types/api/marketplace";

/**
 * GET /api/marketplace/categories — the listing category catalogue.
 *
 * Goes through this app's marketplace proxy rather than `apiFetch`, which is
 * hardwired to the admin prefix. The catalogue barely changes, so it is cached
 * for the session.
 */
export function useCategories() {
  return useQuery({
    queryKey: ["marketplace", "categories"],
    queryFn: async () => {
      const response = await fetch("/api/marketplace/categories", {
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as ApiResponse<CategoryDto[]>;

      if (!payload.isSuccess) {
        throw new ApiError(
          payload.message ?? "Could not load categories.",
          payload.statusCode ?? String(response.status),
          payload.errorCode
        );
      }

      return payload.data ?? [];
    },
    staleTime: Infinity,
  });
}
