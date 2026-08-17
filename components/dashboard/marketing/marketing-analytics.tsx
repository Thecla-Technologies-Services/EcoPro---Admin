"use client";

import * as React from "react";
import { Play, Eye, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Campaign } from "@/types/marketing";
import { FadeIn } from "@/components/motion/fade-in";
import SharedStatCard from "@/components/shared/stat-card";

const CHART_DATA = [
  { month: "Jan", clicks: 150 },
  { month: "Feb", clicks: 280 },
  { month: "Mar", clicks: 620 },
  { month: "Apr", clicks: 480 },
  { month: "May", clicks: 900 },
  { month: "Jun", clicks: 1100 },
  { month: "Jul", clicks: 820 },
  { month: "Aug", clicks: 560 },
  { month: "Sep", clicks: 200 },
  { month: "Oct", clicks: 180 },
  { month: "Nov", clicks: 150 },
  { month: "Dec", clicks: 120 },
];

function formatYAxis(value: number) {
  if (value >= 1_000_000) return `${value / 1_000_000}m`;
  if (value >= 1_000) return `${value / 1_000}k`;
  return String(value);
}

interface AnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export function AnalyticsDialog({
  open,
  onOpenChange,
  campaign,
}: AnalyticsDialogProps) {
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl! gap-0 p-3 md:p-6">
        <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
      
        </DialogClose>

        <DialogTitle className="text-lg font-semibold text-gray-900 mb-0.5">
          Campaigns &amp; App Banners
        </DialogTitle>
        <DialogDescription className="text-xs text-gray-400 mb-5">
          Create and manage promotional banners across the app
        </DialogDescription>

        {/* Stat cards */}
        <div className="grid md:grid-cols-3 gap-3 mb-5">
          {[
            {
              label: "Active Banners",
              value: "4",
              icon: Play,
            },
            {
              label: "Total Impressions",
              value: "40k",
              icon: Eye,
            },
            {
              label: "Average Click-Through Rate",
              value: "5.2%",
              icon: TrendingUp,
            },
          ].map((s) => (
            <FadeIn key={s.label} delay={0.1}>
              <SharedStatCard label={s.label} value={s.value} icon={s.icon} />
            </FadeIn>
          ))}
        </div>

        {/* Chart */}
        <div className="border border-gray-100 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-0.5">
            Clicks Over Time
          </p>
          <p className="text-xs text-gray-400 mb-4">Clicks over Time</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={CHART_DATA}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={36}
                ticks={[100, 200, 500, 1000000, 5000000, 10000000]}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  border: "none",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                formatter={(v) => {
                  if (typeof v === "number") {
                    return [v.toLocaleString(), "Clicks"];
                  }
                  return v;
                }}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#2D7A4F"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#2D7A4F" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign meta */}
        <div className="border border-gray-100 rounded-xl px-3 overflow-auto max-h-37.5 md:px-5 py-4 grid md:grid-cols-4 gap-4">
          {[
            { label: "Placement", value: campaign.placement },
            { label: "Target Audience", value: campaign.targetAudience },
            { label: "Start Date", value: campaign.startDate.split(",")[0] },
            { label: "End Date", value: campaign.endDate.split(",")[0] },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-sm font-semibold text-gray-900">
                {item.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
