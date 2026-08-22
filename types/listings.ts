export type ListingStatus = "Active" | "Flagged" | "Pending";
export type ListingCategory =
  | "Electronics"
  | "Furnitures"
  | "Clothing"
  | "Books"
  | "Others";
export type ListingCondition = "New" | "Like New" | "Good" | "Fair";
export type ListingType = "Sell" | "Donate";

/**
 * A listing as shown in the dashboard.
 *
 * Fields the Admin API does not return are optional — see
 * `lib/adapters/listing.ts` for the mapping and the gaps it documents.
 */
export interface Listing {
  id: string;
  title: string;
  description: string;
  /** The API sends a category name, not one of the fixed labels. */
  category: ListingCategory | string;
  condition: ListingCondition | string;
  status: ListingStatus | string;
  listedBy: string;
  /** Pre-formatted by the API, e.g. "2.5kg". */
  co2Impact: string;
  price: number;
  /** Pre-formatted price when the API supplies one. */
  formattedPrice?: string;
  views: number;
  /** Relative time from the API, e.g. "2 hours ago". */
  createdAt: string;
  /**
   * The list endpoint returns a single `primaryImageUrl`, so this holds at most
   * one entry until a media endpoint is wired up.
   */
  images: string[];
  /** Reason captured when an admin flagged the listing. */
  flagReason?: string;
  /** Account code of the customer who owns the listing. */
  customerAccountCode?: string;
  createdByAdmin?: boolean;
  /** Not returned by the Admin API — see the notes in the adapter. */
  brand?: string;
  size?: string;
  color?: string;
  quantity?: number;
  location?: string;
  type?: ListingType | string;
}
