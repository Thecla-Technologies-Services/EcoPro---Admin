"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useCountUp } from "@/hooks/animations/useCountUp";
import type { DashboardPendingCountersDto } from "@/types/api/admin";

interface SideStatProps {
  number: string | number;
  label: string;
  ref?: React.RefObject<HTMLParagraphElement | null>;
  actionLabel: string;
  href: string;
}

function SideStat({ number, label, actionLabel, ref, href }: SideStatProps) {
  return (
    <div className="flex justify-between items-center bg-background rounded-md p-3 md:p-5">
      <div className="grid gap-2 lg:gap-3 xl:gap-4">
        <p ref={ref} className="text-4xl md:text-5xl font-bold text-foreground">
          {number}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <Link href={href}>
        <Button className="py-3 px-4 text-xs font-medium h-11">
          {actionLabel}
        </Button>
      </Link>
    </div>
  );
}

interface SideStatsProps {
  counters?: DashboardPendingCountersDto;
  isLoading?: boolean;
}

export function SideStats({ counters, isLoading }: SideStatsProps) {
  // Re-runs when the target changes, so the figure counts up once data lands.
  const payoutRef = useCountUp({ target: counters?.totalUserPayout ?? 0 });
  const formattedPayout = counters?.formattedTotalUserPayout ?? null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        <Skeleton className="h-[116px] rounded-md" />
        <Skeleton className="h-[116px] rounded-md" />
        <Skeleton className="h-[116px] rounded-md xl:col-span-2" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <SideStat
        number={counters?.pendingVerificationsCount ?? 0}
        label="Pending Verifications"
        actionLabel="Review Now"
        href="/independent-riders"
      />
      <SideStat
        number={counters?.withdrawalRequestsCount ?? 0}
        label="Withdrawal Request"
        actionLabel="Process Withdrawal"
        href="/wallet"
      />
      <div className="xl:col-span-2">
        <SideStat
          // The count-up animation writes raw digits into this element, which
          // would overwrite the API's pre-formatted figure ("₦340.2M"). So the
          // two are exclusive: animate only when there is nothing formatted to
          // show. Without the ref the hook's effect bails out, so it stays idle.
          number={formattedPayout ?? 0}
          ref={formattedPayout ? undefined : payoutRef}
          label="Total User Payout"
          actionLabel="Review Now"
          href="/wallet"
        />
      </div>
    </div>
  );
}
