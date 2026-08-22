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

export interface BannerFormValues {
  bannerFile: File | null;
  campaignName: string;
  destinationUrl: string;
  placement: AppPlacement;
  audience: TargetAudience;
  startDate: string;
  endDate: string;
}
