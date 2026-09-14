"use client";

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useState } from "react";
import { CountrySelect } from "@/components/shared/country-select";
import { DateRangeFilter } from "@/components/shared/date/date-range-filter";
import type { DateRangeFilterValue } from "@/types/date";

type CustomTooltipProps = {
  active?: boolean;
  payload?: {
    value?: ValueType;
  }[];
  label?: string;
};

const transactionVolume = [
  { month: "Jan", value: 850 },
  { month: "Feb", value: 1050 },
  { month: "Mar", value: 1150 },
  { month: "Apr", value: 1280 },
  { month: "May", value: 1350 },
  { month: "Jun", value: 1420 },
  { month: "Jul", value: 1380 },
  { month: "Aug", value: 1550 },
  { month: "Sep", value: 1680 },
  { month: "Oct", value: 1820 },
  { month: "Nov", value: 1950 },
  { month: "Dec", value: 2200 },
];

const userGrowth = [
  { month: "Jan", value: 5800 },
  { month: "Feb", value: 6200 },
  { month: "Mar", value: 6700 },
  { month: "Apr", value: 7100 },
  { month: "May", value: 7600 },
  { month: "Jun", value: 8200 },
  { month: "Jul", value: 8700 },
  { month: "Aug", value: 9100 },
  { month: "Sep", value: 9600 },
  { month: "Oct", value: 10100 },
  { month: "Nov", value: 10800 },
  { month: "Dec", value: 11400 },
];

const environmentalImpact = [
  { month: "Jan", value: 180 },
  { month: "Feb", value: 320 },
  { month: "Mar", value: 480 },
  { month: "Apr", value: 620 },
  { month: "May", value: 820 },
  { month: "Jun", value: 1050 },
  { month: "Jul", value: 1280 },
  { month: "Aug", value: 1520 },
  { month: "Sep", value: 1780 },
  { month: "Oct", value: 2100 },
  { month: "Nov", value: 2580 },
  { month: "Dec", value: 3232 },
];

const transactionStatus = [
  { name: "Completed", value: 68, color: "#65A669" },
  { name: "Disputed", value: 8, color: "#E74C3C" },
  { name: "Pending", value: 14, color: "#F5A623" },
  { name: "In Transit", value: 10, color: "#4A90E2" },
];

/**
 * A slot rather than a `showCountry` flag, so a card that later needs a date
 * range or an export button takes one without the component growing a prop per
 * control.
 *
 * The header wraps rather than switching layout at a breakpoint, because a
 * card's width does not track the viewport's: the grid below goes two-up at
 * `md`, so a card is *narrower* at 768px than at 640px and any breakpoint that
 * suits one width breaks at the other. Wrapping lets the slot drop to its own
 * line whenever the title and controls cannot share one, at any width. The
 * heading keeps `min-w-0` so a long title truncates rather than pushing the
 * slot out of the card, and a `basis` so it yields the line instead of
 * squeezing the controls to nothing first.
 */
function ChartCard({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-background rounded-lg p-3 md:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1 basis-44">
          <p className="text-sm md:text-base font-semibold text-gray-900">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5 italic">{subtitle}</p>
          )}
        </div>
        {/* `max-w-full` is what keeps an over-wide row inside the card: on its
            own the `shrink-0` that makes the slot claim a line rather than be
            squeezed also lets it run past the card's right edge. Capped, the
            controls inside wrap onto a second line instead. */}
        {actions && (
          <div className="min-w-0 max-w-full shrink-0">{actions}</div>
        )}
      </div>
      <div className="mt-4 md:mt-5">{children}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm text-xs">
        <p className="text-gray-400">{label}</p>
        <p className="font-semibold text-gray-900">
          {payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

export default function Analytics() {
  // Held here rather than inside the control so wiring a period-aware series
  // later is a change to this component, not a lift of state out of a filter.
  // Left undefined so the filter opens on its own default ("This Week") rather
  // than this component asserting a range no chart actually honours yet.
  const [period, setPeriod] = useState<DateRangeFilterValue>();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
        <ChartCard
          title="Transaction Volume"
          subtitle="Monthly transaction trends over the past year"
          actions={<CountrySelect className="h-8 min-w-32 text-xs" />}
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={transactionVolume}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3C8B55" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3C8B55" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3C8B55"
                strokeWidth={2}
                fill="url(#txGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#3C8B55" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Sales Distribution"
          actions={
            <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
              {/* A custom range reads "Sep 14, 2026 - Sep 20, 2026", wider than
                  a two-up card at `md`. Capped and truncated here rather than
                  in the shared filter, where every table gives it a full row. */}
              <DateRangeFilter
                value={period}
                onChange={setPeriod}
                className="h-8 min-w-0 max-w-full text-xs [&>span]:min-w-0 [&>span]:truncate"
              />
              <CountrySelect className="h-8 max-w-full min-w-32 text-xs" />
            </div>
          }
        >
          <div className="flex flex-col items-center gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={transactionStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={1}
                  stroke="#fff"
                >
                  {transactionStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: ValueType | undefined) => [
                    `${Number(value ?? 0).toLocaleString()}%`,
                    "",
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {transactionStatus.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2 md:w-3.5 h-2 md:h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs text-foreground font-semibold">
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: User Growth + Environmental Impact */}
      <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
        <ChartCard
          title="User Growth Trend"
          subtitle="Breakdown of user base growth across segments"
          actions={<CountrySelect className="h-8 min-w-32 text-xs" />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={userGrowth}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9C27B0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickCount={4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#9C27B0"
                strokeWidth={2}
                fill="url(#userGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#9C27B0" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Environmental Impact"
          subtitle="Cumulative CO₂ saved through platform transactions"
          actions={<CountrySelect className="h-8 min-w-32 text-xs" />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={environmentalImpact}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ecoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3C8B55" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3C8B55" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickCount={4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3C8B55"
                strokeWidth={2}
                fill="url(#ecoGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#3C8B55" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
