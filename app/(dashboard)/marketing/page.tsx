"use client";

import * as React from "react";
import Link from "next/link";
import { Play, Eye, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsDialog } from "@/components/dashboard/marketing/marketing-analytics";
import { CampaignsTable } from "@/components/dashboard/marketing/marketing-table";
import {
  SAMPLE_CAMPAIGNS,
  type Campaign,
  type CampaignStatus,
} from "@/types/marketing";
import { FadeIn } from "@/components/motion/fade-in";
import SharedStatCard from "@/components/shared/stat-card";

function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        {
          label: "Active Banners",
          value: "4",
          icon: Play,
          delay: 0.1,
        },
        {
          label: "Total Impressions",
          value: "40k",
          icon: Eye,
          delay: 0.2,
        },
        {
          label: "Average Click-Through Rate",
          value: "5.2%",
          icon: TrendingUp,
          delay: 0.3,
        },
      ].map((s) => (
        <FadeIn key={s.label} delay={s.delay}>
          <SharedStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
          />
        </FadeIn>
      ))}
    </div>
  );
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] =
    React.useState<Campaign[]>(SAMPLE_CAMPAIGNS);
  const [analyticsOpen, setAnalyticsOpen] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    React.useState<Campaign | null>(null);

  function handleViewAnalytics(c: Campaign) {
    setSelectedCampaign(c);
    setAnalyticsOpen(true);
  }

  function handleDelete(id: string) {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  function handlePause(id: string) {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "Paused" as CampaignStatus } : c,
      ),
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-gray-900">
            Campaigns &amp; App Banners
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Create and manage promotional banners across the app
          </p>
        </div>
        <Button
          className="bg-[#2D7A4F] hover:bg-[#235f3d] text-white rounded-lg gap-1.5"
          asChild
        >
          <Link href="/marketing/create-banner">
            <Plus className="w-4 h-4" />
            Create new Banner
          </Link>
        </Button>
      </div>

      <StatCards />

      <CampaignsTable
        campaigns={campaigns}
        onViewAnalytics={handleViewAnalytics}
        onDelete={handleDelete}
        onPause={handlePause}
      />

      <AnalyticsDialog
        open={analyticsOpen}
        onOpenChange={setAnalyticsOpen}
        campaign={selectedCampaign}
      />
    </div>
  );
}
