"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardPendingCountersDto } from "@/types/api/admin";
import { Amount } from "@/components/shared/amount";

interface SideStatProps {
  /** A node, so a figure that converts between currencies brings its markup. */
  number: React.ReactNode;
  label: string;
  actionLabel: string;
  href: string;
}

function SideStat({ number, label, actionLabel, href }: SideStatProps) {
  return (
    <div className="flex justify-between items-center bg-background rounded-md p-3 md:p-5">
      <div className="grid gap-2 lg:gap-3 xl:gap-4">
        <p className="text-4xl md:text-5xl font-bold text-foreground">
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
          // The raw figure rather than `formattedTotalUserPayout`: a
          // pre-formatted string cannot be converted to the header's currency.
          //
          // This also retires the count-up animation on this card. The hook
          // writes raw digits straight into the element, which would overwrite
          // the rendered figure — and it was already idle whenever the API sent
          // a formatted string, which it does.
          number={
            counters?.totalUserPayout === undefined ? (
              (counters?.formattedTotalUserPayout ?? "—")
            ) : (
              <Amount amount={counters.totalUserPayout} compact />
            )
          }
          label="Total User Payout"
          actionLabel="Review Now"
          href="/wallet"
        />
      </div>
    </div>
  );
}
