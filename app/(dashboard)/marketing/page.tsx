"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Eye, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import SharedStatCard from "@/components/shared/stat-card";
import { ActionDialog } from "@/components/shared/action-dialog";
import { AnalyticsDialog } from "@/components/dashboard/marketing/marketing-analytics";
import { CampaignsTable } from "@/components/dashboard/marketing/marketing-table";
import { useAsyncAction } from "@/hooks/use-async-action";
import { CAMPAIGNS } from "@/data/campaigns";
import type { Campaign } from "@/types/marketing";

/**
 * Campaigns reach no endpoint: there is no banner DTO, no query key and no
 * hook for them anywhere.
 *
 * Pausing and deleting used to edit a local copy of the rows, so the row
 * changed on screen and nothing was saved — a success reported for something
 * that never happened. Failing is the honest outcome until the endpoint lands,
 * at which point this body becomes the mutation call and the flow around it is
 * already right.
 */
async function saveCampaignChange(): Promise<never> {
  throw new Error(
    "Campaigns are not connected to the API yet, so this change cannot be saved.",
  );
}

/** Which campaign a confirm dialog is open for, and what it would do to it. */
interface PendingChange {
  verb: "pause" | "delete";
  campaign: Campaign;
}

const COPY = {
  pause: {
    title: "Pause Campaign",
    body: "stops being shown in the app until you resume it",
    confirm: "Pause Campaign",
  },
  delete: {
    title: "Delete Campaign",
    body: "is removed along with its impression and click history",
    confirm: "Delete Campaign",
  },
} as const;

export default function MarketingPage() {
  const [analyticsFor, setAnalyticsFor] = useState<Campaign | null>(null);
  const [pending, setPending] = useState<PendingChange | null>(null);

  const change = useAsyncAction(saveCampaignChange);

  const open = (verb: PendingChange["verb"]) => (id: string) => {
    const campaign = CAMPAIGNS.find((row) => row.id === id);
    if (!campaign) return;
    change.reset();
    setPending({ verb, campaign });
  };

  const close = () => {
    setPending(null);
    change.reset();
  };

  const copy = pending ? COPY[pending.verb] : null;

  return (
    <div className="w-full space-y-6">
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title>Campaigns &amp; App Banners</PageHeader.Title>
          <PageHeader.Description>
            Create and manage promotional banners across the app
          </PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <Button className="gap-1.5 rounded-lg" asChild>
            <Link href="/marketing/create-banner">
              <Plus className="w-4 h-4" />
              Create new Banner
            </Link>
          </Button>
        </PageHeader.Actions>
      </PageHeader>

      {/* Placeholders: no endpoint reports campaign performance. */}
      <StatGrid columns={3}>
        <SharedStatCard label="Active Banners" value="4" icon={Play} />
        <SharedStatCard label="Total Impressions" value="40k" icon={Eye} />
        <SharedStatCard
          label="Average Click-Through Rate"
          value="5.2%"
          icon={TrendingUp}
        />
      </StatGrid>

      <CampaignsTable
        campaigns={CAMPAIGNS}
        onViewAnalytics={setAnalyticsFor}
        onDelete={open("delete")}
        onPause={open("pause")}
      />

      <AnalyticsDialog
        open={Boolean(analyticsFor)}
        onOpenChange={() => setAnalyticsFor(null)}
        campaign={analyticsFor}
      />

      <ActionDialog open={Boolean(pending)} onOpenChange={close}>
        <ActionDialog.Media kind="confirmed" />
        <ActionDialog.Title>{copy?.title}</ActionDialog.Title>
        <ActionDialog.Description>
          <strong>{pending?.campaign.campaignName}</strong> {copy?.body}.
        </ActionDialog.Description>
        <ActionDialog.Error error={change.error} />
        <ActionDialog.Actions>
          <ActionDialog.Cancel onClick={close} disabled={change.isLoading} />
          {pending?.verb === "delete" ? (
            <ActionDialog.Destructive
              onClick={() => change.run()}
              isLoading={change.isLoading}
            >
              {copy?.confirm}
            </ActionDialog.Destructive>
          ) : (
            <ActionDialog.Confirm
              onClick={() => change.run()}
              isLoading={change.isLoading}
            >
              {copy?.confirm}
            </ActionDialog.Confirm>
          )}
        </ActionDialog.Actions>
      </ActionDialog>
    </div>
  );
}
