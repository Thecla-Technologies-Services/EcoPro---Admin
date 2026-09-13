"use client";

import { AlertTriangle } from "lucide-react";
import { SimpleSelect } from "@/components/shared/form/simple-select";
import { useCurrency } from "@/components/shared/currency-context";

/**
 * The currencies offered. Rates come from a third party, so this is a list of
 * what the dashboard is willing to show rather than anything the platform
 * supports — the platform records in one currency per transaction.
 */
const OPTIONS = ["NGN", "GBP", "USD", "GHS", "EUR"].map((code) => ({
  value: code,
  label: code,
}));

/**
 * The dashboard's currency, in the header so the choice holds across pages.
 *
 * Compact by design: a topbar has no room for a caption, so the two states
 * worth knowing are carried on the control itself — a title while rates load,
 * and a warning icon if they could not be fetched, at which point every figure
 * falls back to the currency it was recorded in.
 */
export function CurrencySelect() {
  const { selected, select, isPending, error } = useCurrency();

  return (
    <div
      className="flex shrink-0 items-center gap-1.5"
      title={
        error
          ? "Rates unavailable — amounts are shown as recorded."
          : isPending
            ? "Fetching exchange rates…"
            : undefined
      }
    >
      {Boolean(error) && (
        <AlertTriangle
          className="size-4 text-amber-500"
          aria-label="Rates unavailable — amounts are shown as recorded."
        />
      )}

      <SimpleSelect
        options={OPTIONS}
        value={selected}
        onValueChange={select}
        aria-label="Show amounts in"
        className="h-9 w-auto gap-1.5 rounded-full border-0 bg-white px-3 text-sm font-medium text-foreground"
      />
    </div>
  );
}
