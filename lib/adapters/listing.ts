import type { Listing } from "@/types/listing";
import type {
  AdminListingItemDto,
  ItemCondition,
  ListingType,
} from "@/types/api/admin";

/**
 * Maps a row from `GET /api/admin/listings` onto the shape the listing rows,
 * detail dialog and action menu render.
 *
 * Several fields the UI was designed around have no counterpart in
 * `AdminListingItemDto` and are therefore left unset: `brand`, `size`, `color`,
 * `quantity`, `location`, `type`, and any image beyond `primaryImageUrl`.
 */
export function toListingRow(dto: AdminListingItemDto): Listing {
  return {
    id: dto.id ?? "",
    title: dto.title ?? "Untitled listing",
    description: dto.description ?? "",
    category: dto.categoryName ?? "Uncategorised",
    condition: dto.condition ?? "—",
    status: dto.status ?? "Active",
    listedBy: dto.listedBy ?? "—",
    co2Impact:
      dto.formattedCo2Impact ?? `${(dto.ecoImpactKgCo2 ?? 0).toLocaleString()}kg`,
    price: dto.price ?? 0,
    formattedPrice: dto.formattedPrice ?? undefined,
    views: dto.viewCount ?? 0,
    createdAt: dto.timeAgo ?? "",
    images: dto.primaryImageUrl ? [dto.primaryImageUrl] : [],
    flagReason: dto.flagReason ?? undefined,
    customerAccountCode: dto.customerAccountCode ?? undefined,
    createdByAdmin: dto.createdByAdmin,
  };
}

/** The tabs above the listing rows. Their labels live in the page's markup. */
export type ListingTab = "all" | "active" | "flagged";

/**
 * Values sent as the `Tab` query parameter.
 *
 * The endpoint's swagger summary documents the set as "filter tabs (All, Active,
 * Flagged)", so they are spelled exactly that way: `Tab` is typed as a bare
 * string, and an unrecognised value returns an unfiltered list rather than an
 * error.
 */
export const LISTING_TAB_PARAMS: Record<ListingTab, string | undefined> = {
  all: "All",
  active: "Active",
  flagged: "Flagged",
};

/**
 * The create endpoint accepts the API's own `ItemCondition` values, which are a
 * different (and shorter) set than the mock UI used. These are the real options
 * with readable labels.
 */
export const CONDITION_OPTIONS: { label: string; value: ItemCondition }[] = [
  { label: "Brand New", value: "BrandNew" },
  { label: "Very Good", value: "VeryGood" },
  { label: "Fair", value: "Fair" },
];

/** `listingType` on the create endpoint — the API also supports Swap. */
export const LISTING_TYPE_OPTIONS: { label: string; value: ListingType }[] = [
  { label: "Sell", value: "Sell" },
  { label: "Swap", value: "Swap" },
  { label: "Donate", value: "Donate" },
];
