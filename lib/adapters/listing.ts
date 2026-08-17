import type { Listing } from "@/types/listings";
import type {
  AdminListingItemDto,
  ItemCondition,
  ListingType,
} from "@/types/api/admin";

/**
 * Maps a row from `GET /api/admin/listings` onto the shape the listing rows,
 * detail dialog and action menu render.
 *
 * Three fields the UI was designed around have no counterpart in
 * `AdminListingItemDto` and are therefore left unset: `brand`, `size`, and any
 * image beyond `primaryImageUrl`.
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

/** Tab labels shown above the listing rows. */
export const LISTING_TABS = [
  { value: "all", label: "All Listings" },
  { value: "active", label: "Active" },
  { value: "flagged", label: "Flagged" },
] as const;

export type ListingTab = (typeof LISTING_TABS)[number]["value"];

/**
 * Values sent as the `Tab` query parameter.
 *
 * ASSUMPTION: swagger declares `Tab` as an unconstrained string. These slugs
 * are inferred from the metrics the same endpoint returns (activeListings /
 * flaggedItems). If the API expects other spellings, change them here only.
 */
export const LISTING_TAB_PARAMS: Record<ListingTab, string | undefined> = {
  all: undefined,
  active: "active",
  flagged: "flagged",
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
