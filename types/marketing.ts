export type CampaignStatus = "Active" | "Scheduled" | "Paused" | "Ended";

export type AppPlacement =
  | "Home Dashboard Top"
  | "Home Dashboard Middle"
  | "Home Dashboard Bottom"
  | "Listing Page Top"
  | "Listing Page Bottom"
  | "Swap Page Top";

export type TargetAudience = "All Users" | "Buyers Only" | "Sellers Only" | "New Users";

export interface Campaign {
  id: string;
  bannerUrl?: string;
  campaignName: string;
  status: CampaignStatus;
  placement: AppPlacement;
  clicks: number;
  ctr: number;
  startDate: string;
  endDate: string;
  targetAudience: TargetAudience;
  destinationUrl: string;
}

/**
 * Nothing chosen yet, for a select that starts empty. `""` rather than
 * `undefined` because that is what a Radix select holds before a selection and
 * what `required` validation reads as missing.
 */
export type Unselected = "";

/**
 * What the create-banner form holds while it is being filled in — which is not
 * a `Campaign`. Its two selects start empty, so they carry the domain union
 * plus `Unselected`; the unions themselves stay closed, and a submitted form is
 * narrowed back to them.
 */
export interface BannerFormValues {
  bannerFile: File | null;
  campaignName: string;
  destinationUrl: string;
  placement: AppPlacement | Unselected;
  audience: TargetAudience | Unselected;
  startDate: string;
  endDate: string;
}
