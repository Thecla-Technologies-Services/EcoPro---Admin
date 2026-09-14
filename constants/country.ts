import type { Country } from "@/types/api/admin";
import { humanise } from "@/lib/adapters/shared";

/** Sentinel for "don't filter", since a Radix select item cannot hold "". */
export const ALL_COUNTRIES = "all";

export type CountryFilter = Country | typeof ALL_COUNTRIES;

/**
 * The countries the admin list endpoints accept, paired with readable labels.
 *
 * Values are the API's own `Country` enum members, so `UnitedKingdom` is sent
 * unspaced however it is displayed. The query parameter is typed as a bare
 * string, which means a misspelt value comes back as an unfiltered list rather
 * than an error — hence keeping the spelling in one place.
 *
 * `COUNTRY_OPTIONS` is the same list without the sentinel, for the forms that
 * have to pick exactly one.
 */
export const COUNTRY_OPTIONS: { value: Country; label: string }[] = [
  { value: "Nigeria", label: "Nigeria" },
  { value: "Ghana", label: "Ghana" },
  { value: "UnitedKingdom", label: "United Kingdom" },
];

export const COUNTRY_FILTER_OPTIONS: { value: CountryFilter; label: string }[] =
  [{ value: ALL_COUNTRIES, label: "All Countries" }, ...COUNTRY_OPTIONS];

/** Drops the sentinel, so an unfiltered view sends no `Country` at all. */
export function toCountryParam(filter: CountryFilter): Country | undefined {
  return filter === ALL_COUNTRIES ? undefined : filter;
}

/**
 * The readable label for a country token, for a table cell or a badge.
 *
 * Falls back to spacing the token rather than showing it raw, so a market added
 * to the API before it is added here reads as "United States", not
 * "UnitedStates".
 */
export function toCountryLabel(country: Country | string): string {
  return (
    COUNTRY_OPTIONS.find((option) => option.value === country)?.label ??
    humanise(country)
  );
}
