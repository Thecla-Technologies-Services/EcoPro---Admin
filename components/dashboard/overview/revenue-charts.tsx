'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card'
import { SimpleSelect } from '../../shared/form/simple-select'
import { Skeleton } from '@/components/ui/skeleton'
import type { MonthlyFinancialOverviewDto } from '@/types/api/admin'

const chartOptions = [
  { value: 'all', label: 'All' },
  { value: 'payout', label: 'Payout' },
  { value: 'revenue', label: 'Revenue' },
]

interface RevenueChartProps {
  /** Monthly figures from the API. */
  data?: MonthlyFinancialOverviewDto[]
  isLoading?: boolean
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const [filter, setFilter] = useState('all')

  // The select only toggles which series are drawn, so the data is filtered
  // client-side rather than refetched per selection.
  const chartData = data ?? []

  const showPayout = filter === 'all' || filter === 'payout'
  const showRevenue = filter === 'all' || filter === 'revenue'

  return (
    <Card className="flex flex-col flex-1 bg-background">
      <CardHeader>
        <div>
          <CardTitle>Revenue vs Payout</CardTitle>
          <CardDescription className="italic text-xs">Monthly Financial Overview</CardDescription>
        </div>
        <CardAction>
          <SimpleSelect
            className="w-32 border-[#BDBDBD] border bg-white rounded-full"
            options={chartOptions}
            defaultValue="all"
            onValueChange={setFilter}
          />
        </CardAction>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {isLoading ? (
          <Skeleton className="h-[341px] w-full" />
        ) : !chartData.length ? (
          <div className="grid h-[341px] place-content-center text-sm text-muted-foreground">
            No financial data for this period yet.
          </div>
        ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height={341}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} tickFormatter={(value) => {
                if (value >= 1000000) return `${value / 1000000}m`
                if (value >= 1000) return `${value / 1000}k`
                return value
              }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              {showPayout && (
                <Line
                  type="monotone"
                  dataKey="payout"
                  stroke="#DD7230"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              )}
              {showRevenue && (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3C8B55"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        )}

        {/* Custom Legend */}
        <div className="flex items-center justify-center gap-6 pt-4">
          {showPayout && (
            <div className="flex items-center gap-2">
              <span className="size-3.5 rounded-full bg-[#DD7230]" />
              <span className="text-sm text-muted-foreground font-semibold">Payout</span>
            </div>
          )}
          {showRevenue && (
            <div className="flex items-center gap-2">
              <span className="size-3.5 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground font-semibold">Revenue</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
