import type { ListingType } from "@/types/api/admin";

/** Sentinel for "don't filter", since a Radix select item cannot hold "". */
export const ALL_LISTING_TYPES = "all";

export type ListingTypeFilter = ListingType | typeof ALL_LISTING_TYPES;

/**
 * The listing types the API models, paired with readable labels — mirrors
 * `COUNTRY_FILTER_OPTIONS` so the two toolbar dropdowns stay in step.
 *
 * Values are the API's own `ListingType` enum members.
 */
export const LISTING_TYPE_FILTER_OPTIONS: {
  value: ListingTypeFilter;
  label: string;
}[] = [
  { value: ALL_LISTING_TYPES, label: "All Types" },
  { value: "Sell", label: "Sell" },
  { value: "Swap", label: "Swap" },
  { value: "Donate", label: "Donate" },
];

/** Drops the sentinel, so an unfiltered view sends no `ListingType` at all. */
export function toListingTypeParam(
  filter: ListingTypeFilter
): ListingType | undefined {
  return filter === ALL_LISTING_TYPES ? undefined : filter;
}
