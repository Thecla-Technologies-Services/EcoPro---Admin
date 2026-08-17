import { cn } from "@/lib/utils";
import { type BadgeStatus } from "@/types/order-swap";

const badgeVariants = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  red: { bg: "bg-red-50", text: "text-red-500" },
  green: { bg: "bg-[#3C8B5533]", text: "text-primary" },
  redSoft: { bg: "bg-[#EB575733]", text: "text-[#EB5757]" },
  purple: { bg: "bg-[#6A2AD01A]", text: "text-[#6A2AD0]" },
  blueSoft: { bg: "bg-[#EDF4FE]", text: "text-[#0E3CAB]" },
  gray: { bg: "bg-[#F3F5F5]", text: "text-[#3A3A3A]" },
  cyan: { bg: "bg-[#2980B91A]", text: "text-[#2980B9]" },
  orange: { bg: "bg-[#F39C121A]", text: "text-[#F39C12]" },
  muted: { bg: "bg-background", text: "text-[#828282]" },
} as const;

const statusConfig: Record<BadgeStatus, keyof typeof badgeVariants> = {
  "In Transit": "blue",
  "In Progress": "blue",
  "Pending Pickup": "amber",
  Open: "amber",
  "Pending Review": "amber",
  Pending: "amber",
  Disputed: "red",
  Flagged: "red",
  Buyer: "blueSoft",
  Seller: "amber",
  Delivered: "green",
  Approved: "green",
  Paid: "green",
  Active: "green",
  Resolved: "green",
  Yes: "green",
  "Not Delivered": "redSoft",
  No: "redSoft",
  Rejected: "redSoft",
  Suspended: "redSoft",
  NGO: "purple",
  Delivery: "blueSoft",
  Individual: "gray",
  Scheduled: "cyan",
  Paused: "orange",
  Ended: "muted",
  Closed: "muted",
};

/**
 * Accepts any string because the API returns its own status and role names.
 * Anything not in `statusConfig` renders in the muted style rather than
 * unstyled, so an unmapped value is visible instead of invisible.
 */
export function StatusBadge({ status }: { status: BadgeStatus | string }) {
  const cfg = statusConfig[status as BadgeStatus] ?? "muted";
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs md:text-sm font-medium",
        badgeVariants[cfg]?.bg,
        badgeVariants[cfg]?.text,
      )}
    >
      {status}
    </span>
  );
}
