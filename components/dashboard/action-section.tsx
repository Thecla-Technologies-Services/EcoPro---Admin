"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionItem } from "./action-item";
import type { DashboardActionRequiredDto } from "@/types/api/admin";

/**
 * The API sends `category` as a free-text string, so this maps the categories
 * seen in the dashboard payload to an icon and falls back to a neutral one for
 * anything unrecognised.
 */
const CATEGORY_ICONS: Record<string, string> = {
  verification: "📄",
  withdrawal: "💰",
  payout: "💰",
  listing: "🚩",
  report: "🚩",
  dispute: "⚖️",
  swap: "⚖️",
  editrequest: "✏️",
};

const FALLBACK_ICON = "🔔";

function iconFor(item: DashboardActionRequiredDto) {
  const haystack = `${item.category ?? ""} ${item.actionType ?? ""}`.toLowerCase();
  const match = Object.keys(CATEGORY_ICONS).find((key) => haystack.includes(key));
  return match ? CATEGORY_ICONS[match] : FALLBACK_ICON;
}

interface ActionSectionProps {
  items?: DashboardActionRequiredDto[];
  isLoading?: boolean;
}

export function ActionSection({ items, isLoading }: ActionSectionProps) {
  return (
    <Card className="bg-background">
      <CardHeader className="pb-0">
        <CardTitle className=" font-semibold">Action Required</CardTitle>
        <CardAction>
          <Button variant="link" className="text-sm font-medium text-[#4F4F4F]">
            View all
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="">
        {isLoading ? (
          <div className="grid gap-4 py-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
        ) : !items?.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing needs your attention right now.
          </p>
        ) : (
          items.map((item) => (
            <ActionItem
              key={item.id}
              icon={iconFor(item)}
              title={item.title ?? "Untitled"}
              description={item.subtitle ?? ""}
              timeAgo={item.timeAgo ?? ""}
              actionLabel="Review"
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
