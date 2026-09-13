"use client";

import * as React from "react";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { convert, formatApprox, type Rates } from "@/lib/currency";

/**
 * The currency the dashboard is being read in.
 *
 * Converting uses third-party rates, which the platform has never seen — so a
 * converted figure is marked `≈` and the recorded amount is always kept
 * alongside it, never replaced. A row already in the chosen currency converts
 * nothing, which is most of them.
 */
/**
 * The base rates are quoted against, and the platform's own reporting currency
 * — so it is also what the page opens in.
 */
const BASE = "NGN";

interface CurrencyValue {
  /** A three-letter currency code. */
  selected: string;
  select: (next: string) => void;
  rates: Rates | undefined;
  /** True once a currency is chosen but its rates have not arrived. */
  isPending: boolean;
  /** Set when rates could not be fetched — amounts stay as recorded. */
  error: unknown;
}

const CurrencyContext = React.createContext<CurrencyValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Opens in the platform's own currency: most records are already in it, so
  // most rows convert nothing, and the ones in another currency are exactly the
  // ones worth reading in it.
  const [selected, setSelected] = React.useState<string>(BASE);

  const rates = useExchangeRates(BASE);

  const value = React.useMemo(
    () => ({
      selected,
      select: setSelected,
      rates: rates.data?.rates,
      isPending: rates.isPending,
      error: rates.error,
    }),
    [selected, rates.data, rates.isPending, rates.error],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = React.useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used inside <CurrencyProvider>");
  }
  return context;
}

/**
 * The recorded amount, and its conversion when one is both asked for and
 * available.
 *
 * Returns undefined for the conversion rather than falling back to the recorded
 * figure relabelled — showing `GBP 36,000` for a naira payout is the one
 * mistake that cannot be allowed.
 */
export function useConverted(amount: number, currency: string) {
  const { selected, rates } = useCurrency();

  const recorded = currency || BASE;

  // Nothing to say when the record is already in the chosen currency: the
  // amount above is exact, and repeating it under an `≈` would claim a
  // conversion that never happened.
  if (selected === recorded || !rates) return undefined;

  const value = convert(amount, recorded, selected, BASE, rates);
  return value === undefined ? undefined : formatApprox(value, selected);
}
