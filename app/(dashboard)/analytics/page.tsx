import { LandPlotIcon, Leaf } from "lucide-react";
import {
  IoPeopleOutline,
  IoCashOutline,
  IoWater,
  IoPower,
  IoLogoElectron,
} from "react-icons/io5";
import SharedStatCard from "@/components/shared/stat-card";
import Analytics from "@/components/dashboard/analytics/analytics-charts";
import { FadeIn } from "@/components/motion/fade-in";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-semibold text-foreground">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform insights and performance metrics
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FadeIn delay={0.1}>
          <SharedStatCard
            value="10,204m³"
            label="Landfill Waste Avoided"
            icon={LandPlotIcon}
          />
        </FadeIn>

        <FadeIn delay={0.2}>
          <SharedStatCard
            value="3,232kg"
            label="CO₂ Emissions Avoided"
            icon={Leaf}
          />
        </FadeIn>

        <FadeIn delay={0.3}>
          <SharedStatCard value="300,000L" label="Water Saved" icon={IoWater} />
        </FadeIn>

        <FadeIn delay={0.4}>
          <SharedStatCard
            value="15,800J"
            label="Energy Saved"
            icon={IoLogoElectron}
          />
        </FadeIn>
      </div>
      <Analytics />
    </div>
  );
}
