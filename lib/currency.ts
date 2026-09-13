/**
 * Converting a recorded amount for display.
 *
 * The platform records every figure in the currency it happened in and exposes
 * no rates, so anything here is indicative: a conversion made in the browser
 * from a third-party rate, never something the ledger holds. `formatApprox`
 * carries the `≈` that says so, and callers show the recorded amount too.
 */

/** Rates keyed by currency code, all relative to one base. */
export type Rates = Record<string, number>;

/**
 * `amount` in `from`, expressed in `to`.
 *
 * Undefined when either currency is missing from the table, rather than a
 * number derived from a rate of 1 — a silent identity conversion is the one
 * failure that looks like a success.
 */
export function convert(
  amount: number,
  from: string,
  to: string,
  base: string,
  rates: Rates | undefined,
): number | undefined {
  if (!rates || !from || !to) return undefined;
  if (from === to) return amount;

  // Rates are quoted against the base, so an amount in another currency is
  // taken back to the base before being taken out to the target.
  const fromRate = from === base ? 1 : rates[from];
  const toRate = to === base ? 1 : rates[to];

  if (!fromRate || !toRate) return undefined;

  return (amount / fromRate) * toRate;
}

/** `≈ GBP 18.40` — the `≈` is load-bearing, not decoration. */
export function formatApprox(amount: number, currency: string): string {
  return `≈ ${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
