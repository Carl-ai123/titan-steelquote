'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { formatGBP } from '@/lib/format'

interface StatusData {
  status: string
  count: number
  value: number
}

interface EnquiryStatusChartProps {
  data: StatusData[]
}

const chartConfig = {
  value: {
    label: 'Enquiry Value',
    color: 'var(--color-chart-1)',
  },
  count: {
    label: 'Count',
    color: 'var(--color-chart-2)',
  },
}

export function EnquiryStatusChart({ data }: EnquiryStatusChartProps) {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-semibold text-foreground">
          Enquiries by Status
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Current pipeline breakdown by status — value (£)
        </p>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="status"
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatGBP(Number(value), 0)}
                />
              }
            />
            <Bar
              dataKey="value"
              fill="var(--color-chart-1)"
              radius={[3, 3, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
