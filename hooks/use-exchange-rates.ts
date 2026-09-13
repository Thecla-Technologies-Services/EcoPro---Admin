"use client";

import { useQuery } from "@tanstack/react-query";
import type { Rates } from "@/lib/currency";

interface RatesResponse {
  base: string;
  rates: Rates;
  /** When the provider last refreshed them. */
  fetchedAt: string;
}

/**
 * Exchange rates from `/api/fx`, for the wallet's currency selector.
 *
 * Rates come from a third party rather than the platform, so they are
 * indicative and the UI says so. They move far more slowly than a dashboard is
 * looked at, hence the long stale window and no refetch on focus.
 *
 * A failure is not fatal: the caller falls back to the recorded amounts, which
 * is the honest thing to show when no rate is in hand.
 */
export function useExchangeRates(base: string) {
  return useQuery({
    queryKey: ["fx", base],
    queryFn: async (): Promise<RatesResponse> => {
      const response = await fetch(`/api/fx?base=${base}`);
      if (!response.ok) throw new Error("Could not load exchange rates.");
      return response.json();
    },
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
