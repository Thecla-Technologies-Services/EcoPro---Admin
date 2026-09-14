"use client";

import * as React from "react";
import type { Country } from "@/types/api/admin";

/**
 * The country the dashboard is being read in.
 *
 * Display-only for now: no endpoint accepts this selection yet, so changing it
 * re-labels nothing and refetches nothing. It is held in context rather than in
 * each page's own state so the three pages that offer the control agree on one
 * answer — picking Ghana on Overview still reads Ghana on Wallet — and so that
 * wiring it up later is a change to this file plus the hooks that read it,
 * rather than to every page that shows a dropdown.
 *
 * Sits beside {@link CurrencyProvider}, which is the same shape for the same
 * reason. The two are deliberately separate: currency converts figures already
 * on screen, country would narrow which records are fetched at all.
 */

/**
 * The platform's home market, and so what the dashboard opens in — matching
 * `BASE` in the currency context, which opens in that market's currency.
 */
const DEFAULT_COUNTRY: Country = "Nigeria";

interface CountryValue {
  /** The API's own `Country` enum member, not the displayed label. */
  selected: Country;
  select: (next: Country) => void;
}

const CountryContext = React.createContext<CountryValue | null>(null);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<Country>(DEFAULT_COUNTRY);

  const value = React.useMemo(
    () => ({ selected, select: setSelected }),
    [selected],
  );

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}

export function useCountry() {
  const context = React.useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used inside <CountryProvider>");
  }
  return context;
}
