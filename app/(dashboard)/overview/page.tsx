"use client";

import { Banknote, Leaf } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { IoPeopleOutline, IoChatbubbleOutline } from "react-icons/io5";
import { StatCard } from "@/components/dashboard/overview/stat-card";
import { ActionSection } from "@/components/dashboard/overview/action-section";
import { SideStats } from "@/components/dashboard/overview/side-stats";
import { RevenueChart } from "@/components/dashboard/overview/revenue-charts";
import { DataState } from "@/components/shared/data-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "@/hooks/admin/use-dashboard";
import { Amount } from "@/components/shared/amount";
import { PageHeader } from "@/components/shared/page-header";
import { CountrySelect } from "@/components/shared/country-select";

export default function DashboardPage() {
  const { data, isPending, isError, error, refetch } = useDashboardOverview();

  const metrics = data?.metrics;

  return (
    <div className="space-y-6 ">
      <PageHeader>
        <PageHeader.Heading>
          <PageHeader.Title className="font-semibold">
            Command Centre
          </PageHeader.Title>
          <PageHeader.Description className="italic">
            Overview of your platform performance and pending actions
          </PageHeader.Description>
        </PageHeader.Heading>
        <PageHeader.Actions>
          <CountrySelect />
        </PageHeader.Actions>
      </PageHeader>

      <DataState>
        <DataState.Error
          when={isError}
          error={error}
          onRetry={() => refetch()}
        />
        <DataState.Content className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isPending ? (
              Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-[104px] rounded-lg" />
              ))
            ) : (
              <>
                <FadeIn delay={0.1}>
                  <StatCard
                    value={(metrics?.totalUsers ?? 0).toLocaleString()}
                    label="Total Users"
                    icon={IoPeopleOutline}
                    color="green"
                  />
                </FadeIn>
                <FadeIn delay={0.2}>
                  <StatCard
                    value={
                      metrics?.grossMerchandiseValue === undefined ? (
                        (metrics?.formattedGmv ?? "—")
                      ) : (
                        <Amount
                          amount={metrics.grossMerchandiseValue}
                          compact
                        />
                      )
                    }
                    label="Gross Merchandise Value"
                    icon={Banknote}
                    color="blue"
                  />
                </FadeIn>
                <FadeIn delay={0.3}>
                  <StatCard
                    value={
                      metrics?.formattedCo2Saved ??
                      `${(metrics?.totalCo2SavedKg ?? 0).toLocaleString()}kg`
                    }
                    label="Total CO2 Saved"
                    icon={Leaf}
                    color="emerald"
                  />
                </FadeIn>
                <FadeIn delay={0.4}>
                  <StatCard
                    value={String(metrics?.activeDisputes ?? 0)}
                    label="Active Disputes"
                    icon={IoChatbubbleOutline}
                    color="orange"
                  />
                </FadeIn>
              </>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 xl:grid-cols-2">
            {/* Left Column - Action Section */}
            <div className="lg:col-span-2 xl:col-span-1">
              <ActionSection
                items={data?.actionRequiredItems ?? undefined}
                isLoading={isPending}
              />
            </div>

            {/* Right Column - Side Stats */}
            <div>
              <SideStats
                counters={data?.pendingCounters}
                isLoading={isPending}
              />
            </div>
          </div>

          {/* Revenue Chart */}
          <RevenueChart
            data={data?.financialOverview ?? undefined}
            isLoading={isPending}
          />
        </DataState.Content>
      </DataState>
    </div>
  );
}
