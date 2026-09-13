"use client";

import { useCurrency } from "@/components/shared/currency-context";
import { convert } from "@/lib/currency";

/** The platform's own reporting currency, and what a row means when it says none. */
const BASE = "NGN";

/**
 * One money figure, shown in the currency the dashboard is set to.
 *
 * A converted figure keeps its `≈`: the rate comes from a third party, not from
 * the platform, so the number is indicative and the record itself is unchanged.
 *
 * With no rate in hand — the provider is down, or the currency is not in the
 * table — the amount is shown in the currency it was recorded in. Better a
 * figure in the wrong currency than one converted at a rate nobody has.
 */
export function Amount({
  amount,
  currency,
  /** Prefixed to the converted figure, for a signed ledger row. */
  sign = "",
  /** `NGN 235.8M` rather than the full figure, for a headline stat. */
  compact = false,
  className,
}: {
  amount: number;
  currency?: string;
  sign?: string;
  compact?: boolean;
  className?: string;
}) {
  const { selected, rates } = useCurrency();
  const recorded = currency || BASE;

  const converted =
    selected === recorded
      ? undefined
      : convert(amount, recorded, selected, BASE, rates);

  const format = (value: number, code: string) =>
    `${code} ${value.toLocaleString(
      undefined,
      compact
        ? { notation: "compact", maximumFractionDigits: 1 }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    )}`;

  if (converted === undefined) {
    return (
      <span className={className}>
        {sign}
        {format(amount, recorded)}
      </span>
    );
  }

  return (
    <span className={className}>
      {sign}≈ {format(converted, selected)}
    </span>
  );
}
