"use client";

import { SimpleSelect } from "@/components/shared/form/simple-select";
import { useCountry } from "@/components/shared/country-context";
import { COUNTRY_OPTIONS } from "@/constants/country";
import type { Country } from "@/types/api/admin";
import { cn } from "@/lib/utils";

/**
 * The dashboard's country, for the pages that offer the choice.
 *
 * Labels come from `COUNTRY_OPTIONS` so `UnitedKingdom` keeps displaying as
 * "United Kingdom" here exactly as it does in the filter forms, and so a fourth
 * market is added in one place.
 *
 * The title carries the one state worth knowing, the way `CurrencySelect`
 * carries its rate errors: nothing narrows by country yet, and a control that
 * silently does nothing is worse than one that says so. Drop the wrapper's
 * `title` once an endpoint takes the selection.
 */
export function CountrySelect({ className }: { className?: string }) {
  const { selected, select } = useCountry();

  return (
    <div
      className="flex shrink-0 items-center"
      title="Country filtering is not wired up yet — figures are unchanged."
    >
      <SimpleSelect
        options={COUNTRY_OPTIONS}
        value={selected}
        onValueChange={(next) => select(next as Country)}
        aria-label="Country"
        className={cn(
          "h-9 w-auto min-w-36 gap-1.5 rounded-lg bg-white text-sm font-medium text-foreground",
          className,
        )}
      />
    </div>
  );
}
