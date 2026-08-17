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


export const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    campaignName: "Easy Laundry Campaign",
    status: "Active",
    placement: "Home Dashboard Top",
    clicks: 12009,
    ctr: 3.4,
    startDate: "Feb 7, 2026, 11:23 PM",
    endDate: "Feb 7, 2026, 11:23 PM",
    targetAudience: "All Users",
    destinationUrl: "/HomeDashboard",
  },
  {
    id: "2",
    campaignName: "Easy Laundry Campaign",
    status: "Active",
    placement: "Home Dashboard Top",
    clicks: 12009,
    ctr: 3.4,
    startDate: "Feb 7, 2026, 11:23 PM",
    endDate: "Feb 7, 2026, 11:23 PM",
    targetAudience: "Buyers Only",
    destinationUrl: "/HomeDashboard",
  },
  {
    id: "3",
    campaignName: "Easy Laundry Campaign",
    status: "Scheduled",
    placement: "Home Dashboard Top",
    clicks: 0,
    ctr: 0,
    startDate: "Feb 7, 2026, 11:23 PM",
    endDate: "Feb 7, 2026, 11:23 PM",
    targetAudience: "Sellers Only",
    destinationUrl: "/HomeDashboard",
  },
  {
    id: "4",
    campaignName: "Easy Laundry Campaign",
    status: "Scheduled",
    placement: "Listing Page Top",
    clicks: 0,
    ctr: 0,
    startDate: "Feb 7, 2026, 11:23 PM",
    endDate: "Feb 7, 2026, 11:23 PM",
    targetAudience: "New Users",
    destinationUrl: "/Listings",
  },
  {
    id: "5",
    campaignName: "Easy Laundry Campaign",
    status: "Paused",
    placement: "Home Dashboard Middle",
    clicks: 12009,
    ctr: 3.4,
    startDate: "Feb 7, 2026, 11:23 PM",
    endDate: "Feb 7, 2026, 11:23 PM",
    targetAudience: "All Users",
    destinationUrl: "/HomeDashboard",
  },
  {
    id: "6",
    campaignName: "Easy Laundry Campaign",
    status: "Ended",
    placement: "Swap Page Top",
    clicks: 12009,
    ctr: 3.4,
    startDate: "Feb 7, 2026, 11:23 PM",
    endDate: "Feb 7, 2026, 11:23 PM",
    targetAudience: "All Users",
    destinationUrl: "/Swap",
  },
];